using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddUserDeliveryAddresses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserDeliveryAddresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDeliveryAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDeliveryAddresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Created", "Password", "Salt" },
                values: new object[] { new DateTime(2026, 5, 16, 19, 22, 0, 16, DateTimeKind.Local).AddTicks(9151), "PGh3uN3xpD78WDJW9XPY1yQOJijMwx36tGq0fQNy0g8=", new byte[] { 237, 50, 167, 173, 110, 203, 44, 22, 180, 179, 119, 175, 122, 38, 87, 49 } });

            migrationBuilder.CreateIndex(
                name: "IX_UserDeliveryAddresses_UserId",
                table: "UserDeliveryAddresses",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserDeliveryAddresses");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Created", "Password", "Salt" },
                values: new object[] { new DateTime(2026, 5, 10, 16, 43, 0, 802, DateTimeKind.Local).AddTicks(2967), "sBMbTlsTWw38tmoFqzPtw2ecxMRt1LhgD4UbPaJgiH4=", new byte[] { 158, 142, 152, 56, 115, 57, 221, 194, 178, 134, 65, 146, 68, 34, 23, 139 } });
        }
    }
}
