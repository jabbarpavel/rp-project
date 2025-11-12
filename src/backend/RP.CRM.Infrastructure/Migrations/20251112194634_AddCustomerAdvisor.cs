using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RP.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerAdvisor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Customers_TenantId",
                table: "Customers");

            migrationBuilder.AddColumn<int>(
                name: "AdvisorId",
                table: "Customers",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_AdvisorId",
                table: "Customers",
                column: "AdvisorId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_AdvisorId",
                table: "Customers",
                columns: new[] { "TenantId", "AdvisorId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Users_AdvisorId",
                table: "Customers",
                column: "AdvisorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Users_AdvisorId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_AdvisorId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_TenantId_AdvisorId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "AdvisorId",
                table: "Customers");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId",
                table: "Customers",
                column: "TenantId");
        }
    }
}
