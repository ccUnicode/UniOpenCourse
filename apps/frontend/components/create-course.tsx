'use client';

const createCourse = async (
  event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
) => {
  event.preventDefault();
  // Utilizar funcion fetch para enviar datos al backend (/admin/courses  )
};

export function CreateCourse() {
  return (
    <form onSubmit={createCourse}>
      <input type="text" name="name" placeholder="Course Name" required />
      <input type="text" name="course_code" placeholder="Course Code" required />
      <input type="text" name="description" placeholder="Description" required />
      <input type="file" name="url_image" placeholder="Image URL" required />
      <input type="text" name="teacher_name" placeholder="Teacher Name" required />
      <button type="submit">Create Course</button>
    </form>
  );
}
