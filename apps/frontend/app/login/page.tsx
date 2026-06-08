'use client';
const baseUrl = process.env.API_URL || 'http://localhost:3001';

const handleSubmit = async (
  event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
) => {
  event.preventDefault();
  // Utilizar funcion fetch para enviar datos al backend
};

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo Electrónico:</label>
        <input type="email" id="email" name="email" required />
        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
