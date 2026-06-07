import { SetMetadata } from '@nestjs/common';

export const DOWNLOAD_FILE_KEY = 'download_file_stream';

/**
 * Decorador para marcar endpoints que retornan un archivo binario (Buffer)
 * para su descarga directa en el cliente.
 */
export const DownloadFile = () => SetMetadata(DOWNLOAD_FILE_KEY, true);
