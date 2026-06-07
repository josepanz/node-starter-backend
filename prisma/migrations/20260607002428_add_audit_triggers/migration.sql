CREATE OR REPLACE FUNCTION fn_audit_generic_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_data_to_sign TEXT;
    v_secret_key TEXT := 'node_starter_secret_pepper_2026'; 
    v_current_user TEXT;
    v_aud_version INT := 1;
    v_current_ip TEXT;
BEGIN
    v_current_user := COALESCE(COALESCE(NEW.last_changed_by, OLD.last_changed_by), COALESCE(current_setting('app.current_user_id', true), session_user));
    v_current_ip := COALESCE(current_setting('app.client_ip', true), inet_client_addr()::text);

    IF (TG_OP = 'UPDATE') THEN
        v_old_data := to_jsonb(OLD) - 'last_changed_at' - 'last_changed_by' - 'checksum' - 'change_signature' - 'aud_version';
        v_new_data := to_jsonb(NEW) - 'last_changed_at' - 'last_changed_by' - 'checksum' - 'change_signature' - 'aud_version';

        IF (v_old_data = v_new_data) THEN
            RETURN NEW;
        END IF;

        NEW.last_changed_at := CURRENT_TIMESTAMP;
        IF NEW.last_changed_by IS NULL THEN
            NEW.last_changed_by := v_current_user;
        ELSE
            v_current_user := NEW.last_changed_by;
        END IF;

        SELECT COALESCE(MAX(aud_version), 0) + 1
        INTO v_aud_version
        FROM audit_logs
        WHERE
            table_name = TG_TABLE_NAME
            AND record_id = COALESCE(NEW.id::text, OLD.id::text);

    ELSIF (TG_OP = 'INSERT') THEN
        v_new_data := to_jsonb(NEW) - 'last_changed_at' - 'last_changed_by' - 'checksum' - 'change_signature' - 'aud_version';
        v_aud_version := 1;
        NEW.created_at := CURRENT_TIMESTAMP;
        IF NEW.created_by IS NULL THEN
            NEW.created_by := v_current_user;
        ELSE
            v_current_user := NEW.created_by;
        END IF;

    ELSIF (TG_OP = 'DELETE') THEN
        v_old_data := to_jsonb(OLD);
        SELECT COALESCE(MAX(aud_version), 1)
        INTO v_aud_version
        FROM audit_logs
        WHERE
            table_name = TG_TABLE_NAME
            AND record_id = OLD.id::text;
    END IF;

    IF (TG_OP <> 'DELETE') THEN
        NEW.checksum := md5(v_new_data::text);
        v_data_to_sign := (COALESCE(NEW.id::text, '') || NEW.checksum || v_aud_version::text || v_secret_key);
        NEW.change_signature := md5(v_data_to_sign);
    END IF;

    INSERT INTO audit_logs (
        table_name,
        record_id,
        operation_type,
        old_data,
        new_data,
        changed_at,
        changed_by,
        reason,
        ip_address,
        user_agent,
        aud_version,
        extra_data,
        change_signature
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        TG_OP,
        v_old_data,
        v_new_data,
        CURRENT_TIMESTAMP,
        v_current_user,
        COALESCE(NEW.changed_reason, OLD.changed_reason),
        v_current_ip,
        COALESCE(NULLIF(current_setting('app.user_agent', true), ''), NULLIF(current_setting('application_name', true), ''), 'unknown'),
        v_aud_version,
        CASE
            WHEN NULLIF(current_setting('app.application_name', true), '') IS NOT NULL
            THEN jsonb_build_object('applicationName', current_setting('app.application_name', true))::text
            ELSE NULL
        END,
        COALESCE(NEW.change_signature, OLD.change_signature)
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- para crear recursivamente
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'change_signature' 
        AND table_schema = 'public'
        AND table_name <> 'audit_logs'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON %I', t.table_name, t.table_name);
        EXECUTE format('CREATE TRIGGER trg_audit_%I 
                        BEFORE INSERT OR UPDATE OR DELETE ON %I 
                        FOR EACH ROW EXECUTE FUNCTION fn_audit_generic_trigger()', 
                        t.table_name, t.table_name);
    END LOOP;
END;
$$;