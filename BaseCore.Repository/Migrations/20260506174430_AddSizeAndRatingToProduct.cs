using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSizeAndRatingToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Rating",
                table: "Products",
                type: "decimal(3,1)",
                precision: 3,
                scale: 1,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "Products",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "ShippingAddress",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Rating", "Size" },
                values: new object[] { 4.5m, "M" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Rating", "Size" },
                values: new object[] { 4.6m, "L" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Rating", "Size" },
                values: new object[] { 4.7m, "M" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Rating", "Size" },
                values: new object[] { 4.2m, "M" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Rating", "Size" },
                values: new object[] { 4.1m, "M" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Created", "Password", "Salt" },
                values: new object[] { new DateTime(2026, 5, 7, 0, 44, 30, 542, DateTimeKind.Local).AddTicks(2223), "Ar5d2ZE+qo6+vpb7Q+UddS69gYlkDEJ4YX1eqfvr1Lk=", new byte[] { 87, 205, 175, 7, 162, 62, 216, 247, 85, 41, 199, 248, 81, 193, 186, 163 } });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "Products");

            migrationBuilder.AlterColumn<string>(
                name: "ShippingAddress",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Created", "Password", "Salt" },
                values: new object[] { new DateTime(2026, 4, 28, 0, 36, 0, 476, DateTimeKind.Local).AddTicks(3378), "J++71GAn0E0dNMcWATCH8ekGJyj9GoqIrwnd4dcltdA=", new byte[] { 240, 217, 232, 174, 43, 81, 187, 241, 196, 179, 247, 155, 169, 251, 165, 138 } });
        }
    }
}
