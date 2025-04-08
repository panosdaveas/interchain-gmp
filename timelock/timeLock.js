const { roundAt, timelockEncrypt, timelockDecrypt } = require("tlock-js");
const {
  quicknetClient,
} = require("drand-client");

function tLock() {
  const client = quicknetClient();

  const tlEncrypt = async (tlAge, payload) => {
    const decryptionTime = tlAge.getTime();
    try {
      const chainInfo = await client.chain().info();
      const roundNumber = await roundAt(decryptionTime, chainInfo);
      const ciphertext = await timelockEncrypt(
        roundNumber,
        Buffer.from(payload),
        client
      );
      return {
        ciphertext,
        client,
      };
    } catch (error) {
      console.error("Time-lock encryption error:", error);
      throw error;
    }
  };

  const tlDecrypt = async (ciphertext) => {
    try {
      console.log = function () {};
      const decrypted = await timelockDecrypt(ciphertext, client);
      console.log(decrypted);
      const plaintext = decrypted.toString();
      return plaintext;
    } catch (error) {
      throw error;
    }
  };

  return {
    tlEncrypt,
    tlDecrypt,
  };
}

module.exports = {
  tLock,
};
