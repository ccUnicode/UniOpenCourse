import re
import os

filepath = r"c:\Users\nunez\OneDrive\Desktop\Unicode\Desarrollo\prueba\UniOpenCourse\docs\endpoints.md"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find endpoints
pattern = re.compile(r'(## (GET|POST|PUT|PATCH|DELETE) .*?)(?=\n## (?:GET|POST|PUT|PATCH|DELETE)|$)', re.DOTALL)

def process_endpoint(match):
    block = match.group(1)
    
    # Replace or add Reglas de negocio
    if '### Reglas de negocio' not in block:
        # insert before ### Requerimientos relacionados
        if '### Requerimientos relacionados' in block:
            block = block.replace('### Requerimientos relacionados', '### Reglas de negocio\n\nNinguna regla específica adicional.\n\n### Requerimientos relacionados')
        else:
            block += '\n\n### Reglas de negocio\n\nNinguna regla específica adicional.\n'
            
    # Always replace Requerimientos relacionados content
    if '### Requerimientos relacionados' in block:
        # Replace everything after Requerimientos relacionados until the end or next section
        req_pattern = re.compile(r'### Requerimientos relacionados\n.*?(?=\n### |\Z)', re.DOTALL)
        block = req_pattern.sub('### Requerimientos relacionados\n\n- [Completar requerimientos]\n', block)
    else:
        block += '\n\n### Requerimientos relacionados\n\n- [Completar requerimientos]\n'
        
    return block

new_content = pattern.sub(process_endpoint, content)

# Append missing endpoints
missing = """
---

## GET /search

### Descripción
Busca cursos y clases globalmente.

### Autenticación
No requiere autenticación.

### Roles permitidos
Público.

### Parámetros de ruta
Ninguno.

### Query params
| Parámetro | Tipo   | Requerido | Descripción |
|---|---|---|---|
| q | string | No | Término de búsqueda |
| page | number | No | Página (default 1) |

### Body
Ninguno.

### Respuesta 200
Resultados unificados y paginados.

### Errores posibles
Ninguno documentado.

### Reglas de negocio
La búsqueda se realiza insensible a mayúsculas sobre `Course` y `Class`.

### Requerimientos relacionados
- [Completar requerimientos]

---

## POST /auth/logout

### Descripción
Cierra la sesión del usuario.

### Autenticación
Requerida.

### Roles permitidos
Usuario autenticado.

### Parámetros de ruta
Ninguno.

### Query params
Ninguno.

### Body
Ninguno.

### Respuesta 200
```json
{ "message": "Logout exitoso" }
```

### Errores posibles
Ninguno.

### Reglas de negocio
Depende de que el cliente invalide la sesión/cookie local.

### Requerimientos relacionados
- [Completar requerimientos]

---

## POST /auth/admin/login

### Descripción
Inicia sesión para administradores.

### Autenticación
No requerida.

### Roles permitidos
Público.

### Parámetros de ruta
Ninguno.

### Query params
Ninguno.

### Body
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| email | string | Sí | Correo o usuario |
| password | string | Sí | Contraseña |

### Respuesta 200
Token JWT e información del admin.

### Errores posibles
| Código | Caso |
|---|---|
| 401 | Credenciales inválidas o rol no es ADMIN |

### Reglas de negocio
Valida explícitamente que el rol del usuario sea ADMIN.

### Requerimientos relacionados
- [Completar requerimientos]

---

## GET /admin/classes/:id

### Descripción
Obtiene el detalle administrativo de una clase.

### Autenticación
Requerida.

### Roles permitidos
Administrador.

### Parámetros de ruta
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| id | number | Sí | ID de la clase |

### Query params
Ninguno.

### Body
Ninguno.

### Respuesta 200
Detalle de la clase y sus materiales.

### Errores posibles
| Código | Caso |
|---|---|
| 404 | Clase no encontrada |

### Reglas de negocio
Solo disponible para administradores.

### Requerimientos relacionados
- [Completar requerimientos]

---

## POST /admin/courses

### Descripción
Crea un nuevo curso.

### Autenticación
Requerida.

### Roles permitidos
Administrador.

### Parámetros de ruta
Ninguno.

### Query params
Ninguno.

### Body
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| name | string | Sí | Nombre del curso |
| course_code | string | Sí | Código único |
| description | string | Sí | Descripción |
| url_image | string | Sí | URL imagen |
| teacher_id | number | Sí | ID Docente |

### Respuesta 201
Curso creado.

### Errores posibles
| Código | Caso |
|---|---|
| 409 | course_code ya existe |

### Reglas de negocio
El código de curso debe ser único en toda la base de datos.

### Requerimientos relacionados
- [Completar requerimientos]

---

## GET /admin/courses

### Descripción
Lista cursos para administración con paginación.

### Autenticación
Requerida.

### Roles permitidos
Administrador.

### Parámetros de ruta
Ninguno.

### Query params
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| page | number | No | Página (default 1) |
| limit | number | No | Límite por página (default 10) |

### Body
Ninguno.

### Respuesta 200
Listado paginado de cursos.

### Errores posibles
Ninguno.

### Reglas de negocio
Ninguna regla específica adicional.

### Requerimientos relacionados
- [Completar requerimientos]

---

## GET /admin/courses/:id

### Descripción
Obtiene el detalle administrativo de un curso.

### Autenticación
Requerida.

### Roles permitidos
Administrador.

### Parámetros de ruta
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| id | number | Sí | ID del curso |

### Query params
Ninguno.

### Body
Ninguno.

### Respuesta 200
Detalle completo del curso.

### Errores posibles
| Código | Caso |
|---|---|
| 404 | Curso no encontrado |

### Reglas de negocio
Ninguna regla específica adicional.

### Requerimientos relacionados
- [Completar requerimientos]

---

## PATCH /admin/courses/:id

### Descripción
Actualiza los datos de un curso.

### Autenticación
Requerida.

### Roles permitidos
Administrador.

### Parámetros de ruta
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| id | number | Sí | ID del curso |

### Query params
Ninguno.

### Body
Atributos opcionales de Course.

### Respuesta 200
Curso actualizado.

### Errores posibles
| Código | Caso |
|---|---|
| 404 | Curso no encontrado |

### Reglas de negocio
Envia url_trikaweb como "" es interpretado como nulo en BD.

### Requerimientos relacionados
- [Completar requerimientos]

---

## DELETE /admin/courses/:id

### Descripción
Elimina un curso.

### Autenticación
Requerida.

### Roles permitidos
Administrador.

### Parámetros de ruta
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| id | number | Sí | ID del curso |

### Query params
Ninguno.

### Body
Ninguno.

### Respuesta 200
Curso eliminado exitosamente.

### Errores posibles
| Código | Caso |
|---|---|
| 404 | Curso no encontrado |

### Reglas de negocio
Al eliminarse se borran en cascada clases y materiales.

### Requerimientos relacionados
- [Completar requerimientos]

---

## GET /admin/materials

### Descripción
Lista todos los materiales globalmente para el panel administrativo.

### Autenticación
Requerida.

### Roles permitidos
Administrador.

### Parámetros de ruta
Ninguno.

### Query params
Ninguno.

### Body
Ninguno.

### Respuesta 200
Listado de materiales.

### Errores posibles
Ninguno.

### Reglas de negocio
Ninguna regla específica adicional.

### Requerimientos relacionados
- [Completar requerimientos]

---

## GET /materials/:id/download

### Descripción
Descarga o visualiza un material físico.

### Autenticación
No requerida.

### Roles permitidos
Público.

### Parámetros de ruta
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| id | number | Sí | ID del material |

### Query params
Ninguno.

### Body
Ninguno.

### Respuesta 200
Stream del archivo binario.

### Errores posibles
| Código | Caso |
|---|---|
| 404 | Material o archivo físico no encontrado |

### Reglas de negocio
Verifica la existencia del archivo físico antes de servirlo para evitar excepciones.

### Requerimientos relacionados
- [Completar requerimientos]
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content + missing)
