using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddProductNameToOrderDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProductName",
                table: "OrderDetails",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Created", "Password", "Salt" },
                values: new object[] { new DateTime(2026, 5, 10, 16, 35, 14, 145, DateTimeKind.Local).AddTicks(3846), "RRfXIqUAc/j0A5vZ9AfvrXONoQzaSy9wshX3Vj5CDc8=", new byte[] { 239, 163, 36, 19, 72, 178, 41, 49, 8, 19, 172, 221, 125, 142, 18, 41 } });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductName",
                table: "OrderDetails");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Created", "Password", "Salt" },
                values: new object[] { new DateTime(2026, 5, 7, 0, 44, 30, 542, DateTimeKind.Local).AddTicks(2223), "Ar5d2ZE+qo6+vpb7Q+UddS69gYlkDEJ4YX1eqfvr1Lk=", new byte[] { 87, 205, 175, 7, 162, 62, 216, 247, 85, 41, 199, 248, 81, 193, 186, 163 } });
        }
    }
}
