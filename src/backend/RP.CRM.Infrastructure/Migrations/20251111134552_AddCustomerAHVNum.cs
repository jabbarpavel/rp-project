using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RP.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerAHVNum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AHVNum",
                table: "Customers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AHVNum",
                table: "Customers");
        }
    }
}
