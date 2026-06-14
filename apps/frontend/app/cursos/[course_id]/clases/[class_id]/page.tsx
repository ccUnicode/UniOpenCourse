const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getMaterialData(class_id: string) {
  let response = await fetch(`${baseUrl}/classes/${class_id}/materials`);
  let materials = await response.json();
  return materials;
}

async function getClassData(class_id: string) {
  let response = await fetch(`${baseUrl}/classes/${class_id}`);
  let clase = await response.json();
  return clase;
}
export default async function Clase({
  params,
}: {
  params: Promise<{ class_id: string }>;
}) {
  const { class_id } = await params;
  const clase = await getClassData(class_id);
  const materials = await getMaterialData(class_id);

  return (
    <>
      <h1>{clase.title}</h1>
      <p>{clase.description}</p>
      <iframe
        width="560"
        height="315"
        src={clase.url_youtube} // Asegurar que el link sea youtube embed
        title="YouTube video player"
      ></iframe>
      <h2>Materials</h2>
      <ul>
        {materials.map((material: any) => (
          <li key={material.material_id}>{material.filename} </li>
        ))}
      </ul>
    </>
  );
}
