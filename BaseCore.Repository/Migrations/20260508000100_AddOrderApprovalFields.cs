using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    [DbContext(typeof(MySqlDbContext))]
    [Migration("20260508000100_AddOrderApprovalFields")]
    public partial class AddOrderApprovalFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApprovalNotes",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedBy",
                table: "Orders",
                type: "int",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalNotes",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Orders");
        }
    }
}
