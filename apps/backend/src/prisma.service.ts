// 1. IMPORTACIONES DE ORGANIZACIONES EN NODE_MODULES
// Extracción de decoradores centrales desde el paquete corporativo '@nestjs'.
import { Injectable, OnModuleInit } from '@nestjs/common';

// 2. IMPORTACIONES LOCALES AUTOGENERADAS
// PrismaClient NO viene de node_modules, viene de tu propia computadora ('./generated...').
// Es literalmente el código Javascript/Typescript que la computadora fabricó al fotocopiar el schema.prisma.
// Contiene todos los métodos vitales (.findMany, .create) específicamente moldeados a los Usuarios y Cursos.
import { PrismaClient } from './generated/prisma/client';

// 3. ADAPTADORES OFICIALES (@prisma)
// PrismaPg es un adaptador requerido para motores modernos de Postgres. 
// A diferencia del import local anterior, este sí proviene de 'node_modules'. 
// Prisma usa la arroba (@prisma) porque, igual que Nest, agrupa todos sus complementos oficiales y de paga bajo una carpeta organizacional.
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * SERVICIO CENTRAL DE BASE DE DATOS Y LA "INYECCIÓN"
 * 
 * INYECTAR
 * Inyectar no es más que "Pasar la herramienta ya construida".
 * En vez de que el Controlador de Materiales y el Controlador de Clases deban escribir código repetido 
 * para iniciar sesión en la Base de Datos, este archivo 'PrismaService' prende el motor central una sola vez y se queda esperando.
 * Gracias a que le ponemos la etiqueta '@Injectable()', le autorizamos a NestJS tomar este motor prendido, clonarlo, 
 * e INYECTARLO (pasárselo directamente a la mano) a cualquier código controlador que lo pida en su constructor.
 */
// ESTA ES UNA CLASE PLENA Y PURA.
// "extends": Herencia directa de POO. 
// Al usarlo, `PrismaService` se devora y absorbe automáticamente todas las funciones y catálogos de `PrismaClient`.
// "implements OnModuleInit": Contrato de Typescript. Es una promesa estricta que le hacemos al sistema 
// jurando que obligatoriamente escribiremos una función llamada `onModuleInit` más abajo. Si incumplimos, compilará error.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // EL CONSTRUCTOR: Es la función automática que se ejecuta en el milisegundo en que la clase nace.
  // ¿Por qué tiene paréntesis vacíos ()?
  // Porque esta clase es independiente. No necesita que otros archivos le pasen parámetros desde afuera 
  // para autoconstruirse. Ella misma recolecta lo que necesita adentro de sus llaves {}.
  constructor() {
    
    // INSTANCIACIÓN DE OBJETOS POO:
    // `PrismaPg` ES UNA CLASE.
    // Al tipear `new PrismaPg(...)`, estamos creando un Objeto nuevo, real y palpable, y guardándolo en la constante `adapter`.
    // Toda esta sintaxis es solo para meter la URL de process.env 
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    // LA LLAMADA AL PADRE (`super`):
    // Es lógica pura de Herencia POO. Usar `super()` significa "Llamar al constructor del archivo del Padre que heredé".
    // Ya que usamos `extends PrismaClient`, `super()` le está entregando nuestro Objeto `adapter` (con la URL viva)
    // directamente a la maquinaria central de PrismaClient para que sepa a qué base de datos debe conectarse.
    super({
      adapter,
    });
  }
  
  // LA PROMESA DEL CONTRATO (onModuleInit)
  // Esta es la función que juramos crear al poner "implements OnModuleInit" allá arriba.
  // NestJS la buscará y la disparará por su cuenta inmediatamente después de arrancar el servidor.
  async onModuleInit() {
    // `$connect` es una de las cientos de funciones que nos robamos gratis del padre gracias al 'extends'.
    await this.$connect();
  }
}
