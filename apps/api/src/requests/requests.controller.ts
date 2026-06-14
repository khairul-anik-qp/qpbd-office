import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { CreateRequestResponse, ListRequestsPage, Request, User } from "@office/shared";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { CreateRequestDto, ForwardRequestDto, ListRequestsQueryDto } from "./dto/requests.dto";
import { RequestsService } from "./requests.service";

@Controller("requests")
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Get()
  list(
    @CurrentUser() user: User,
    @Query() query: ListRequestsQueryDto,
  ): Promise<Request[] | ListRequestsPage> {
    return this.requests.listForUser(user, query);
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateRequestDto,
  ): Promise<CreateRequestResponse> {
    return this.requests.create(user, dto);
  }

  @Post(":id/accept")
  accept(@CurrentUser() user: User, @Param("id") id: string): Promise<Request> {
    return this.requests.accept(user, id);
  }

  @Post(":id/forward")
  forward(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: ForwardRequestDto,
  ): Promise<Request> {
    return this.requests.forward(user, id, dto.targetStaffId);
  }

  @Post(":id/complete")
  complete(@CurrentUser() user: User, @Param("id") id: string): Promise<Request> {
    return this.requests.complete(user, id);
  }

  @Post(":id/cancel")
  cancel(@CurrentUser() user: User, @Param("id") id: string): Promise<Request> {
    return this.requests.cancel(user, id);
  }
}
