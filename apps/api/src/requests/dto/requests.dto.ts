import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { LOCATIONS, type RequestType, type Urgency } from "@office/shared";

const REQUEST_TYPES: RequestType[] = [
  "tea",
  "snack",
  "supply",
  "printer",
  "help",
  "other",
];

const URGENCY_LEVELS: Urgency[] = ["normal", "urgent"];
const LOCATION_IDS = LOCATIONS.map((l) => l.id);

export class CreateRequestDto {
  @IsIn(REQUEST_TYPES)
  type!: RequestType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsIn(URGENCY_LEVELS)
  urg?: Urgency;

  @IsString()
  @IsIn(LOCATION_IDS)
  loc!: string;

  @IsOptional()
  @IsString()
  assignee?: string | null;
}

export class ForwardRequestDto {
  @IsString()
  @IsNotEmpty()
  targetStaffId!: string;
}
