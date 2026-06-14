const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getCourseData() {
  let response = await fetch(`${baseUrl}/courses/dashboard`);
  let courses = await response.json();
  return courses;
}

export default function Dashboard() {
  return <h1>User Dashboard</h1>;
}
