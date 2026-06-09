using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace RP.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerNoteVersioningAndSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "CustomerNotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedByUserId",
                table: "CustomerNotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "CustomerNotes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedByUserId",
                table: "CustomerNotes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CustomerNoteHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CustomerNoteId = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    EditedByUserId = table.Column<int>(type: "integer", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerNoteHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerNoteHistories_CustomerNotes_CustomerNoteId",
                        column: x => x.CustomerNoteId,
                        principalTable: "CustomerNotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerNoteHistories_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerNoteHistories_Users_EditedByUserId",
                        column: x => x.EditedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerNotes_DeletedByUserId",
                table: "CustomerNotes",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerNotes_IsDeleted",
                table: "CustomerNotes",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerNotes_UpdatedByUserId",
                table: "CustomerNotes",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerNoteHistories_CustomerNoteId",
                table: "CustomerNoteHistories",
                column: "CustomerNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerNoteHistories_EditedByUserId",
                table: "CustomerNoteHistories",
                column: "EditedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerNoteHistories_TenantId_CustomerNoteId_EditedAt",
                table: "CustomerNoteHistories",
                columns: new[] { "TenantId", "CustomerNoteId", "EditedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerNotes_Users_DeletedByUserId",
                table: "CustomerNotes",
                column: "DeletedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerNotes_Users_UpdatedByUserId",
                table: "CustomerNotes",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerNotes_Users_DeletedByUserId",
                table: "CustomerNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerNotes_Users_UpdatedByUserId",
                table: "CustomerNotes");

            migrationBuilder.DropTable(
                name: "CustomerNoteHistories");

            migrationBuilder.DropIndex(
                name: "IX_CustomerNotes_DeletedByUserId",
                table: "CustomerNotes");

            migrationBuilder.DropIndex(
                name: "IX_CustomerNotes_IsDeleted",
                table: "CustomerNotes");

            migrationBuilder.DropIndex(
                name: "IX_CustomerNotes_UpdatedByUserId",
                table: "CustomerNotes");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "CustomerNotes");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "CustomerNotes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "CustomerNotes");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "CustomerNotes");
        }
    }
}
