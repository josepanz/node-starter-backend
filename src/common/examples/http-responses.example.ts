export const unauthorizedResponseExample = {
  error: 'Unauthorized',
  errors: [
    {
      field: '_',
      message: 'Token inválido o expirado',
    },
  ],
  timestamp: '2025-10-28T10:30:00-03:00',
};

export const forbiddenResponseExample = {
  error: 'Forbidden',
  errors: [
    {
      field: '_',
      message: 'No tiene permisos para operar con tarjetas',
    },
  ],
  timestamp: '2025-10-28T10:30:00-03:00',
};

export const internalServerErrorExample = {
  error: 'Internal Server Error',
  errors: [
    {
      field: '_',
      message: 'Error inesperado',
    },
  ],
  timestamp: '2025-10-28T10:30:00-03:00',
};

export const badRequestResponseExample = {
  error: 'Bad Request',
  errors: [
    {
      field: 'entityId',
      message: 'El campo es requerido',
    },
  ],
  timestamp: '2025-10-28T10:30:00-03:00',
};
