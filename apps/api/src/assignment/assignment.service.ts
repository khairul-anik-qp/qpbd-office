import { Injectable } from "@nestjs/common";
import { resolveAssignment, type AssignmentResult } from "@office/shared";
import { UsersService } from "../users/users.service";

@Injectable()
export class AssignmentService {
  constructor(private readonly users: UsersService) {}

  async route(chosenAssignee: string | null | undefined): Promise<AssignmentResult> {
    const staff = await this.users.listActiveStaff();
    return resolveAssignment(chosenAssignee ?? null, staff);
  }
}
