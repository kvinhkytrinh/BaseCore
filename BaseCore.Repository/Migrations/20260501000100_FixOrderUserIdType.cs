using BaseCore.Repository;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    [DbContext(typeof(MySqlDbContext))]
    [Migration("20260501000100_FixOrderUserIdType")]
    public partial class FixOrderUserIdType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID(N'[Orders]')
      AND c.name = N'UserId'
      AND t.name = N'uniqueidentifier'
)
BEGIN
    DECLARE @defaultConstraint nvarchar(256);

    SELECT @defaultConstraint = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'[Orders]')
      AND c.name = N'UserId';

    IF @defaultConstraint IS NOT NULL
    BEGIN
        EXEC(N'ALTER TABLE [Orders] DROP CONSTRAINT [' + @defaultConstraint + N']');
    END

    ALTER TABLE [Orders] DROP COLUMN [UserId];
    ALTER TABLE [Orders] ADD [UserId] int NOT NULL CONSTRAINT [DF_Orders_UserId] DEFAULT 0;
    ALTER TABLE [Orders] DROP CONSTRAINT [DF_Orders_UserId];
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID(N'[Orders]')
      AND c.name = N'UserId'
      AND t.name = N'int'
)
BEGIN
    DECLARE @defaultConstraint nvarchar(256);

    SELECT @defaultConstraint = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'[Orders]')
      AND c.name = N'UserId';

    IF @defaultConstraint IS NOT NULL
    BEGIN
        EXEC(N'ALTER TABLE [Orders] DROP CONSTRAINT [' + @defaultConstraint + N']');
    END

    ALTER TABLE [Orders] DROP COLUMN [UserId];
    ALTER TABLE [Orders] ADD [UserId] uniqueidentifier NOT NULL CONSTRAINT [DF_Orders_UserId] DEFAULT NEWID();
    ALTER TABLE [Orders] DROP CONSTRAINT [DF_Orders_UserId];
END
");
        }
    }
}
