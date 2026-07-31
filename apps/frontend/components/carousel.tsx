'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '../interfaces/course.interface';
import { useEffect, useState } from 'react';

export default function Carousel({ data }: { data: Course[] }) {
  const courses_carousel = data;
  const courses_length = courses_carousel.length;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % courses_length);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [current, courses_length]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % courses_length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + courses_length) % courses_length);
  };
  console.log(courses_carousel);
  return (
    <div className="overflow-hidden w-128">
      <div
        style={{ transform: `translateX(-${current * 100}%)` }}
        className="flex transition-transform duration-600 ease-in-out w-full flex-nowrap cursor-pointer"
      >
        {courses_carousel.map((course: Course) => (
          <Link href={`/cursos/${course.course_id}`} key={course.course_id}>
            <div className="group relative overflow-hidden min-w-128 w-full rounded-2xl border-border bg-background-secondary">
              <div className="flex items-center gap-0 transition-all duration-300 ease-in-out overflow-hidden group-hover:gap-1 font-bold absolute top-4 left-4 bg-header-bg rounded-full px-3 py-1 text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 7 8"
                  className="mt-0.5 w-0 group-hover:w-2 h-2 transition-all duration-300 ease-in-out overflow-hidden"
                >
                  <path
                    fill="#fff"
                    d="M0 .494C0 .41.02.328.058.254a.448.448 0 0 1 .63-.192L6.262 3.36a.51.51 0 0 1 0 .863L.688 7.521a.433.433 0 0 1-.225.062C.207 7.583 0 7.363 0 7.09V.494Z"
                  />
                </svg>
                <p>Ir al curso</p>
              </div>
              <figure className="relative h-64 w-full">
                <Image
                  src={course.url_image}
                  alt={course.name}
                  className="object-cover"
                  fill
                />
              </figure>
              <div className="p-6 w-full flex flex-col gap-2 border-border border rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{course.name}</h2>
                  <span className="px-4 py-1 bg-accent rounded-full text-xs">
                    {course.course_code}
                  </span>
                </div>
                <p className="line-clamp-2">{course.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex gap-4 mt-4 justify-center items-center">
        <button
          onClick={prev}
          className="rounded-full bg-background-secondary w-10 h-10 cursor-pointer text-center flex items-center justify-center text-2xl font-bold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="12"
            fill="none"
            viewBox="0 0 8 12"
          >
            <path fill="#F8F9FF" d="M6 12 0 6l6-6 1.4 1.4L2.8 6l4.6 4.6L6 12Z" />
          </svg>
        </button>
        <div className="flex gap-2 items-center justify-center">
          {Array.from({ length: courses_length }, (_, index) => (
            <button
              className={`w-3 h-3 cursor-pointer bg-accent rounded-full ${current === index ? 'opacity-100' : 'opacity-50'}`}
              key={index}
              onClick={() => setCurrent(index)}
            ></button>
          ))}
        </div>
        <button
          onClick={next}
          className="rounded-full bg-background-secondary w-10 h-10 cursor-pointer text-center flex items-center justify-center text-2xl font-bold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="12"
            fill="none"
            viewBox="0 0 8 12"
          >
            <path fill="#F8F9FF" d="M4.6 6 0 1.4 1.4 0l6 6-6 6L0 10.6 4.6 6Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
