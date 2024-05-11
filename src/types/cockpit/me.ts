// define the type of the data
export default interface Me {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    details: string;
    is_student: boolean;
    is_teacher: boolean;
    is_admin: boolean;
  };
}
