const SafeMathIntMock = artifacts.require('SafeMathIntMock');

const BN = web3.utils.BN;
const _require = require('app-root-path').require;
const BlockchainCaller = _require('/util/blockchain_caller');
const chain = new BlockchainCaller(web3);

require('chai')
  .use(require('chai-bn')(BN))
  .should();

contract('SafeMathInt', function () {
  const MIN_INT256 =
    new BN(new BN(-2)).pow(new BN(255));
  const MAX_INT256 =
    new BN(2).pow(new BN(255)).sub(new BN(1));

  let safeMathInt;

  beforeEach(async function () {
    safeMathInt = await SafeMathIntMock.new();
  });

  async function returnVal (tx) {
    return (await tx).logs[0].args.val;
  }

  describe('add', function () {
    it('adds correctly', async function () {
      const a = new BN(5678);
      const b = new BN(1234);

      (await returnVal(safeMathInt.add(a, b)))
        .should.be.bignumber.eq(a.add(b));
    });

    it('should fail on addition overflow', async function () {
      const a = MAX_INT256;
      const b = new BN(1);

      expect(
        await chain.isEthException(safeMathInt.add(a, b))
      ).to.be.true;
      expect(
        await chain.isEthException(safeMathInt.add(b, a))
      ).to.be.true;
    });

    it('should fail on addition overflow, swapped args', async function () {
      const a = new BN(1);
      const b = MAX_INT256;

      expect(
        await chain.isEthException(safeMathInt.add(a, b))
      ).to.be.true;
      expect(
        await chain.isEthException(safeMathInt.add(b, a))
      ).to.be.true;
    });

    it('should fail on addition negative overflow', async function () {
      const a = MIN_INT256;
      const b = new BN(-1);

      expect(
        await chain.isEthException(safeMathInt.add(a, b))
      ).to.be.true;
      expect(
        await chain.isEthException(safeMathInt.add(b, a))
      ).to.be.true;
    });
  });

  describe('sub', function () {
    it('subtracts correctly', async function () {
      const a = new BN(5678);
      const b = new BN(1234);

      (await returnVal(safeMathInt.sub(a, b)))
        .should.be.bignumber.eq(a.sub(b));
    });

    it('should fail on subtraction overflow', async function () {
      const a = MAX_INT256;
      const b = new BN(-1);

      expect(
        await chain.isEthException(safeMathInt.sub(a, b))
      ).to.be.true;
    });

    it('should fail on subtraction negative overflow', async function () {
      const a = MIN_INT256;
      const b = new BN(1);

      expect(
        await chain.isEthException(safeMathInt.sub(a, b))
      ).to.be.true;
    });
  });

  describe('mul', function () {
    it('multiplies correctly', async function () {
      const a = new BN(1234);
      const b = new BN(5678);

      (await returnVal(safeMathInt.mul(a, b)))
        .should.be.bignumber.eq(a.mul(b));
    });

    it('handles a zero product correctly', async function () {
      const a = new BN(0);
      const b = new BN(5678);

      (await returnVal(safeMathInt.mul(a, b)))
        .should.be.bignumber.eq(a.mul(b));
    });

    it('should fail on multiplication overflow', async function () {
      const a = MAX_INT256;
      const b = new BN(2);

      expect(
        await chain.isEthException(safeMathInt.mul(a, b))
      ).to.be.true;
      expect(
        await chain.isEthException(safeMathInt.mul(b, a))
      ).to.be.true;
    });

    it('should fail on multiplication negative overflow', async function () {
      const a = MIN_INT256;
      const b = new BN(2);

      expect(
        await chain.isEthException(safeMathInt.mul(a, b))
      ).to.be.true;
      expect(
        await chain.isEthException(safeMathInt.mul(b, a))
      ).to.be.true;
    });

    it('should fail on multiplication between -1 and MIN_INT256',
      async function () {
        const a = MIN_INT256;
        const b = new BN(-1);

        expect(
          await chain.isEthException(safeMathInt.mul(a, b))
        ).to.be.true;
        expect(
          await chain.isEthException(safeMathInt.mul(b, a))
        ).to.be.true;
      });
  });

  describe('div', function () {
    it('divides correctly', async function () {
      const a = new BN(5678);
      const b = new BN(5678);

      (await returnVal(safeMathInt.div(a, b)))
        .should.be.bignumber.eq(a.div(b));
    });

    it('should fail on zero division', async function () {
      const a = new BN(5678);
      const b = new BN(0);

      expect(
        await chain.isEthException(safeMathInt.div(a, b))
      ).to.be.true;
    });

    it('should fail when MIN_INT256 is divided by -1', async function () {
      const a = MIN_INT256;
      const b = new BN(-1);

      expect(
        await chain.isEthException(safeMathInt.div(a, b))
      ).to.be.true;
    });
  });

  describe('abs', function () {
    it('works for 0', async function () {
      (await returnVal(safeMathInt.abs(0))).should.be.bignumber.eq(new BN(0));
    });

    it('works on positive numbers', async function () {
      (await returnVal(safeMathInt.abs(100)))
        .should.be.bignumber.eq(new BN(100));
    });

    it('works on negative numbers', async function () {
      (await returnVal(safeMathInt.abs(-100)))
        .should.be.bignumber.eq(new BN(100));
    });

    it('fails on overflow condition', async function () {
      expect(
        await chain.isEthException(safeMathInt.abs(MIN_INT256))
      ).to.be.true;
    });
  });
});
