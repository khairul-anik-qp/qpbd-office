import { Type } from "class-transformer";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { LOCATIONS, type RequestStatus, type RequestType, type Urgency } from "@office/shared";

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
const REQUEST_STATUSES: RequestStatus[] = ["new", "progress", "done", "discarded"];

export class ListRequestsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsIn(REQUEST_STATUSES)
  status?: RequestStatus;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;
}

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
