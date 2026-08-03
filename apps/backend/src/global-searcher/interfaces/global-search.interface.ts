export interface GlobalSearchItem {
  type: 'course' | 'class';

  id: number;

  /**
   * The id of the parent entity
   * course: course_id
   * class: class_id
   */
  secondary_id: number;

  /**
   * The main text displayed in the search result
   * course: course name
   * class: class title
   */
  title: string;

  /**
   * A secondary piece of information about the search result
   * course: teacher name
   * class: course name
   */
  subtitle: string;

  image: string | null;

  /**
   * A brief description of the search result
   * course: course description
   * class: class description
   */
  description: string | null;

  /**
   * Additional information shown with the result
   * course: course code
   * class: parent course code
   */
  meta: string;
}
