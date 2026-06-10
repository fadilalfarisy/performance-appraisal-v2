import { ApiProperty } from "@nestjs/swagger";

export class DepartmentResponse {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: "Department Name" })
    name: string;
}