import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  credential!: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  credential!: string;

  @IsIn(["employee", "staff"])
  role!: "employee" | "staff";
}
