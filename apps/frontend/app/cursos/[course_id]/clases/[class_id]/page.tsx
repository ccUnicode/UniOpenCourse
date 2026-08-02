import { Material } from '@/interfaces/material.interface';
import { getClassData, getMaterialData } from '@/services/classes.service';
import { notFound } from 'next/navigation';

export default async function Clase({
  params,
}: {
  params: Promise<{ class_id: string }>;
}) {
  const { class_id } = await params;
  if (class_id != parseInt(class_id).toString()) {
    notFound();
  }
  const clase = await getClassData(class_id);
  if (clase.error) {
    notFound();
  }
  const materials = await getMaterialData(class_id);
  console.log(clase);

  return (
    <>
      <h1>{clase.title}</h1>
      <p>{clase.description}</p>
      {clase.url_youtube ? (
        <iframe
          width="560"
          height="315"
          src={clase.url_youtube}
          title="YouTube video player"
        ></iframe>
      ) : null}

      <h2>Materials</h2>
      {materials.error ? (
        <p>Error: {materials.message}</p>
      ) : (
        <ul>
          {materials.map((material: Material) => (
            <li key={material.material_id}>{material.class_id} </li>
          ))}
        </ul>
      )}
    </>
  );
}
