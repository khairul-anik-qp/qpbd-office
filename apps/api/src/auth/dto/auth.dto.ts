import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

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

export class ApproveStaffDto {
  @IsString()
  @IsOptional()
  nameBn?: string;
}
