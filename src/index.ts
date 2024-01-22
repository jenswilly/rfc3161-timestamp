/* eslint-disable no-bitwise */
import { KJUR, hextoArrayBuffer } from "jsrsasign";
import axios from "axios";

/**
 * Local function to perform Base64 encoding of an array buffer.
 *
 * @param arrayBuffer `ArrayBuffer` to convert to Base64.
 * @returns Returns a `string` containing the Base64 representation.
 */
function base64ArrayBuffer(arrayBuffer: ArrayBuffer): string {
	var base64 = "";
	var encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	var bytes = new Uint8Array(arrayBuffer);
	var byteLength = bytes.byteLength;
	var byteRemainder = byteLength % 3;
	var mainLength = byteLength - byteRemainder;

	var a, b, c, d;
	var chunk;

	// Main loop deals with bytes in chunks of 3
	for (var i = 0; i < mainLength; i = i + 3) {
		// Combine the three bytes into a single integer
		chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

		// Use bitmasks to extract 6-bit segments from the triplet
		a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
		b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
		c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
		d = chunk & 63; // 63       = 2^6 - 1

		// Convert the raw binary segments to the appropriate ASCII encoding
		base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
	}

	// Deal with the remaining bytes and padding
	if (byteRemainder === 1) {
		chunk = bytes[mainLength];

		a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

		// Set the 4 least significant bits to zero
		b = (chunk & 3) << 4; // 3   = 2^2 - 1

		base64 += encodings[a] + encodings[b] + "==";
	} else if (byteRemainder === 2) {
		chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

		a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
		b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

		// Set the 2 least significant bits to zero
		c = (chunk & 15) << 2; // 15    = 2^4 - 1

		base64 += encodings[a] + encodings[b] + encodings[c] + "=";
	}

	return base64;
}

/**
 * Local function for creating a random nonce string.
 * @param length Number of hex characters
 * @returns A `string` containing a random hex number
 */
function createNonce(length: number): string {
	let result = "";
	const characters = "0123456789ABCDEF";
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
		counter += 1;
	}
	return result;
}

/**
 * Function to create a SHA-256 hash of all fields values.
 *
 * @param fields Dictionary with fields to generate hash for.
 * @returns A `string` containing the SHA-256 digest.
 */
const createHash = (payload: string) => {
	// Using SHA-256
	let digest = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "cryptojs" });
	digest.updateString(payload);
	return digest.digest();
};

const createRFC3161Request = (payload: string, includeCertificate: boolean, nonce: string): string => {
	const hash = createHash(payload);
	const alg = "sha256"; // Hardcoded to SHA-256

	let request = {
		messageImprint: {
			alg,
			hash,
		},
		nonce: { hex: nonce },
		certreq: includeCertificate,
	};

	// console.log(`Generating request:\n${JSON.stringify(request)}`);

	// The next two lines report errors, but they do work. The @types/... are not up to date so `@ts-ignore` it is...
	// @ts-ignore
	const o = new KJUR.asn1.tsp.TimeStampReq(request) as KJUR.asn1.ASN1Object;
	// @ts-ignore
	const hex = o.tohex().toLowerCase();
	return hex;
};

/**
 * Create an RFC3161 secure timestamp from the specified fields.
 *
 * Note: the fileds should be _simple_ types or arrays only. No objects.
 * This is because the `.value` of an object will simply be `[object Object]`.
 *
 * The resulting RFC3161 reply is base64 encoded and returned.
 * The reply can be validated with:
 * `echo <base64 reply> | base64 -d > resply.tsr && openssl ts -reply -in reply.tsr -text
 *
 * @param url URL of timestamp server. E.g. "https://rfc3161.ai.moda"
 * @param fields Dictionary with all fields be be timestamped.
 * @param includeCertificate Whether the request should include `certreq: true`
 * @returns
 */
export const timestampFields = async (url: string, fields: { [key: string]: any }, includeCertificate: boolean = true) => {
	// Construct value string by joining all values with | character.
	const payload = Object.values(fields).join("|");
	return await performRFC3161Timestamp(url, payload, includeCertificate);
};

/**
 * Create an RFC3161 secure timestamp from the specified plaintext string.
 *
 * The resulting RFC3161 reply is base64 encoded and returned.
 * The reply can be validated with:
 * `echo <base64 reply> | base64 -d > resply.tsr && openssl ts -reply -in reply.tsr -text
 *
 * @param url URL of timestamp server. E.g. "https://rfc3161.ai.moda"
 * @param plainext String to be timestamped
 * @param includeCertificate Whether the request should include `certreq: true`
 * @returns
 */
export const timestampPlaintext = async (url: string, plaintext: string, includeCertificate: boolean = true) => {
	return await performRFC3161Timestamp(url, plaintext, includeCertificate);
};

// Private function to perform the actual timestamping
const performRFC3161Timestamp = async (url: string, payload: string, includeCertificate: boolean = true) => {
	const nonce = createNonce(32);
	const requestHexString = createRFC3161Request(payload, includeCertificate, nonce);

	// Convert hex string to byte array
	const data = hextoArrayBuffer(requestHexString);

	try {
		const res = await axios({
			method: "POST",
			url, //API url
			data, // Buffer
			headers: {
				"Content-Type": "application/timestamp-query",
			},
			responseType: "arraybuffer",
		});

		// console.log(`Binary: ${ArrayBuffertohex(res.data).length}`);
		// ↑ the resulting hex string (saved as reply.hex) can be verified using:
		// xxd -r -p <reply.hex> > reply.tsr && openssl ts -reply -in <reply.tsr> -text

		const base64String = base64ArrayBuffer(res.data);
		// ↑ Base64 is slightly smaller than hex-binary
		// Verify (saved as reply.b64) with:
		// base64 -d -i <resply.b64> > resply.tsr && openssl ts -reply -in <reply.tsr> -text

		return {
			signedData: payload,
			timestampReply: base64String,
		};
	} catch (error) {
		// TODO: don't catch the error: caller should do that
		// console.log("Error:" + error);
	}
};

export const _functionsForTesting = {
	base64ArrayBuffer,
	createHash,
	createRFC3161Request,
	// We are not able to test the actual timestamping since the time changes so we don't know what to expect...
};
