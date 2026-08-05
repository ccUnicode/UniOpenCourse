import CourseHero from '@/features/courses/components/CourseHero';
import CourseMaterials from '@/features/courses/components/CourseMaterials';
import { getClassData, getMaterialData } from '@/services/classes.service';
import { notFound } from 'next/navigation';

const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getCourse(course_id: string) {
  const response = await fetch(`${baseUrl}/courses/${course_id}`);
  const course = await response.json();
  return course;
}
export default async function Clase({
  params,
}: {
  params: Promise<{ course_id: string; class_id: string }>;
}) {
  const { course_id, class_id } = await params;
  
  if (class_id != parseInt(class_id).toString()) {
    notFound();
  }

  const course = await getCourse(course_id);
  const clase = await getClassData(class_id);
  if (clase.error === 'Not Found') {
    notFound();
  }
  const materials = await getMaterialData(class_id);
  console.log(clase);

  if (course.error === 'Not Found' || course.statusCode === 404 || clase.error === 'Not Found') {
    notFound();
  }

  return (
    <div className="flex flex-col w-full bg-[#0f1714]">
      <CourseHero 
        courseName={course.name}
        courseCode={course.course_code}
        description={course.description}
        imageUrl={course.url_image}
        teacher={course.teacher} 
      />

      <div id="reproductor" className="px-12 pt-6 pb-4">
        <h1 className="text-3xl text-white font-bold mb-4">{clase.title}</h1>
        <p className="text-gray-400 mb-8">{clase.description}</p>
        
        {clase.url_youtube && (
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
            <iframe 
              src={clase.url_youtube} 
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>

      <div className="px-12 pb-12">
        <CourseMaterials materials={materials} />
      </div>
    </div>
  );
}
