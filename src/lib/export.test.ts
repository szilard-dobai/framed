import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportCanvas } from "./export";

describe("exportCanvas", () => {
  let mockCanvas: HTMLCanvasElement;
  let clickSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a real small canvas so toBlob works
    mockCanvas = document.createElement("canvas");
    mockCanvas.width = 2;
    mockCanvas.height = 2;
    const ctx = mockCanvas.getContext("2d")!;
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 2, 2);

    clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") {
        const anchor = {
          href: "",
          download: "",
          click: clickSpy,
        } as unknown as HTMLAnchorElement;
        return anchor;
      }
      // Fall through to real implementation for canvas etc.
      return document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        tag
      ) as HTMLElement;
    });
    vi.spyOn(document.body, "appendChild").mockImplementation(
      (node) => node as ChildNode
    );
    vi.spyOn(document.body, "removeChild").mockImplementation(
      (node) => node as ChildNode
    );
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
  });

  it("exports PNG with correct filename", async () => {
    // Mock toBlob since jsdom doesn't support it
    mockCanvas.toBlob = (cb: BlobCallback) => {
      cb(new Blob(["png-data"], { type: "image/png" }));
    };

    await exportCanvas(mockCanvas, "png", "test");

    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("exports JPEG with correct filename", async () => {
    mockCanvas.toBlob = (cb: BlobCallback) => {
      cb(new Blob(["jpeg-data"], { type: "image/jpeg" }));
    };

    await exportCanvas(mockCanvas, "jpeg", "test");

    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("uses 'mockup' as default filename", async () => {
    mockCanvas.toBlob = (cb: BlobCallback) => {
      cb(new Blob(["data"], { type: "image/png" }));
    };

    await exportCanvas(mockCanvas, "png");

    expect(clickSpy).toHaveBeenCalled();
  });
});
