using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace RP.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomerRelationships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    RelatedCustomerId = table.Column<int>(type: "integer", nullable: false),
                    RelationshipType = table.Column<string>(type: "text", nullable: false),
                    IsPrimaryContact = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerRelationships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerRelationships_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerRelationships_Customers_RelatedCustomerId",
                        column: x => x.RelatedCustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerRelationships_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerRelationships_CustomerId_RelatedCustomerId",
                table: "CustomerRelationships",
                columns: new[] { "CustomerId", "RelatedCustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerRelationships_RelatedCustomerId",
                table: "CustomerRelationships",
                column: "RelatedCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerRelationships_TenantId_CustomerId",
                table: "CustomerRelationships",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerRelationships_TenantId_RelatedCustomerId",
                table: "CustomerRelationships",
                columns: new[] { "TenantId", "RelatedCustomerId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerRelationships");
        }
    }
}
