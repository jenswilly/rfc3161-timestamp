import { _functionsForTesting } from "../src/index";

describe("test base64 encoding", () => {
	it("should encode a simple string correctly", () => {
		const encoder = new TextEncoder();
		const buffer = encoder.encode("Hejsa");
		expect(_functionsForTesting.base64ArrayBuffer(buffer)).toBe("SGVqc2E=");
	});

	it("should encode a more complex string correctly", () => {
		const encoder = new TextEncoder();
		const buffer = encoder.encode("Line 1\næøå~ÆØÅ\nhttps://shortcut.io/something?dweefle=false&id=123");
		expect(_functionsForTesting.base64ArrayBuffer(buffer)).toBe("TGluZSAxCsOmw7jDpX7DhsOYw4UKaHR0cHM6Ly9zaG9ydGN1dC5pby9zb21ldGhpbmc/ZHdlZWZsZT1mYWxzZSZpZD0xMjM=");
	});

	it("should end with two equals signs", () => {
		const encoder = new TextEncoder();
		const buffer = encoder.encode("Dweefle");
		expect(_functionsForTesting.base64ArrayBuffer(buffer).endsWith("==")).toBeTruthy();
	});
});

describe("sha-256 hasing", () => {
	it("should generate exepcted hash", () => {
		const hash = _functionsForTesting.createHash("test|123|true");
		expect(hash).toBe("7a49f65bb8d27599974680c2868c4b9d24ebe4d61d5a80d9fbc85222c254a7ad");
	});
});

describe("RFC3161 request generation", () => {
	it("should generate the expected RFC3161 request", () => {
		const nonce = "F13EDFE67124B9006D781753B4499EF3";	// 32 bytes static nonce
		const payload = "test|123|true";					// Sample form payload
		const request = _functionsForTesting.createRFC3161Request(payload, false, nonce);
		expect(request).toBe("30480201013031300d0609608648016503040201050004207a49f65bb8d27599974680c2868c4b9d24ebe4d61d5a80d9fbc85222c254a7ad0210f13edfe67124b9006d781753b4499ef3");

		// The actual request can be validated by:
		// echo -n "<output>" > request.hex && xxd -r -p request.hex > request.tsq && openssl ts -query -in request.tsq -text
		// This should 1) report no errors and 2) show a SHA-256 starting with "7a 49 f6 5b" and 3) report a nonce of 0x-0EC120198EDB46FF9287E8AC4BB6610D
	});
});
