import CourseHero from '@/features/courses/components/CourseHero';
import { mockCourse, mockClassesData, mockMaterials } from '@/features/courses/mocks/course.mocks';

const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getCourse(course_id: string) {
  let response = await fetch(`${baseUrl}/courses/${course_id}`);
  let course = await response.json();
  return course;
}

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
  params: Promise<{ course_id: string; class_id: string }>;
}) {
  const { course_id, class_id } = await params;
  
  let course = await getCourse(course_id);
  let clase = await getClassData(class_id);
  let materials = await getMaterialData(class_id);

  // Mocks de fallback
  if (course.statusCode === 404 || course.error || !course.name) course = mockCourse;
  if (clase.statusCode === 404 || clase.error || !clase.title) clase = mockClassesData[class_id] || mockClassesData["1"];
  if (materials.statusCode === 404 || materials.error || !Array.isArray(materials)) materials = mockMaterials;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto no-scrollbar bg-[#0f1714]">
      {/* 1. Cabecera (Hero) del Curso */}
      <CourseHero 
        courseName={course.name}
        courseCode={course.course_code}
        description={course.description}
        imageUrl={course.url_image}
        teacher={course.teacher} 
      />

      {/* Línea divisoria verde oscuro (estilo minecraft) */}
      <div className="relative w-full z-20">
        <div className="w-full h-[1px] bg-[#01392a]"></div>
        <div className="absolute top-[1px] left-0 w-full h-12 bg-gradient-to-b from-[#01392a]/60 to-transparent pointer-events-none"></div>
      </div>

      {/* 2. Reproductor de Video */}
      <div className="p-12">
        <h1 className="text-3xl text-white font-bold mb-4">{clase.title}</h1>
        <p className="text-gray-400 mb-8">{clase.description}</p>
        
        {/* Contenedor del video con aspect-ratio 16:9 */}
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
          <iframe 
            src={clase.url_youtube} 
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* 3. Materiales */}
      <div className="px-12 pb-12">
        <h2 className="text-2xl text-white font-bold mt-12 mb-4">Materiales</h2>
        <ul className="text-gray-300">
          {materials.map((material: any) => (
            <li key={material.material_id} className="py-2">{material.filename}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
