using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class MakeProductNameNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ProductName",
                table: "OrderDetails",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Created", "Password", "Salt" },
                values: new object[] { new DateTime(2026, 5, 10, 16, 43, 0, 802, DateTimeKind.Local).AddTicks(2967), "sBMbTlsTWw38tmoFqzPtw2ecxMRt1LhgD4UbPaJgiH4=", new byte[] { 158, 142, 152, 56, 115, 57, 221, 194, 178, 134, 65, 146, 68, 34, 23, 139 } });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ProductName",
                table: "OrderDetails",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Created", "Password", "Salt" },
                values: new object[] { new DateTime(2026, 5, 10, 16, 35, 14, 145, DateTimeKind.Local).AddTicks(3846), "RRfXIqUAc/j0A5vZ9AfvrXONoQzaSy9wshX3Vj5CDc8=", new byte[] { 239, 163, 36, 19, 72, 178, 41, 49, 8, 19, 172, 221, 125, 142, 18, 41 } });
        }
    }
}
