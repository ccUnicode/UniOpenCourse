'use client';
const baseUrl = process.env.API_URL || 'http://localhost:3001';

const handleSubmit = async (
  event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
) => {
  event.preventDefault();
  // Utilizar funcion fetch para enviar datos al backend
};

export default function Registro() {
  return (
    <div>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nombres:</label>
        <input type="text" id="name" name="name" required />
        <label htmlFor="last_name">Apellidos:</label>
        <input type="text" id="last_name" name="last_name" required />
        <label htmlFor="username">Nombre de Usuario:</label>
        <input type="text" id="username" name="username" required />
        <label htmlFor="email">Correo Electrónico:</label>
        <input type="email" id="email" name="email" required />
        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
