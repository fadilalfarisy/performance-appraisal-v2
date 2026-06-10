import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: "[EMAIL_ADDRESS]" })
    email: string;

    @ApiProperty({ example: { employeeId: 1, name: "John Doe" } })
    employee: {
        id: number;
        name: string;
    } | null;

    @ApiProperty({ example: "2022-01-01T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2022-01-01T00:00:00.000Z" })
    updatedAt: Date;
}