import { buildReminderMessage, detectAttachmentType, parseCsvLine } from "./ledgerDashboardHelpers";

describe("ledgerDashboardHelpers", () => {
  it("detectAttachmentType detects image, pdf and other", () => {
    expect(
      detectAttachmentType({
        id: "1",
        transactionId: "t1",
        fileName: "proof.jpg",
        fileType: "image/jpeg",
        fileUrl: "/a.jpg",
        uploadedAt: "2026-04-12",
        tenantId: "x",
      }),
    ).toBe("image");

    expect(
      detectAttachmentType({
        id: "2",
        transactionId: "t1",
        fileName: "invoice.pdf",
        fileType: "application/pdf",
        fileUrl: "/a.pdf",
        uploadedAt: "2026-04-12",
        tenantId: "x",
      }),
    ).toBe("pdf");

    expect(
      detectAttachmentType({
        id: "3",
        transactionId: "t1",
        fileName: "notes.txt",
        fileType: "text/plain",
        fileUrl: "/a.txt",
        uploadedAt: "2026-04-12",
        tenantId: "x",
      }),
    ).toBe("other");
  });

  it("parseCsvLine handles quoted commas and escapes", () => {
    const row = parseCsvLine('"A, B",100,"he said ""ok"""');
    expect(row).toEqual(["A, B", "100", 'he said "ok"']);
  });

  it("buildReminderMessage uses fallback when no customer", () => {
    expect(
      buildReminderMessage({
        selectedCustomer: null,
      }),
    ).toContain("review your ledger balance");
  });

  it("buildReminderMessage applies placeholders", () => {
    const text = buildReminderMessage({
      selectedCustomer: {
        id: "c1",
        name: "Ravi",
        phone: "9876543210",
        totalBalance: 250,
      },
      businessName: "HisabKit Shop",
      template: "Hi {{customerName}}, {{businessName}}, {{balanceType}}, {{customerPhone}}",
    });

    expect(text).toContain("Ravi");
    expect(text).toContain("HisabKit Shop");
    expect(text).toContain("to pay");
    expect(text).toContain("9876543210");
  });
});
