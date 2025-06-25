import { Field } from "../src";
import moment from "moment";

describe("Field", () => {
  beforeAll(() => {
    moment.locale("es");
  });

  describe("set", () => {
    it('returns "" if the value is null', () => {
      expect(new Field(null, "string").value).toBe("");
    });

    it("maps the supported types", () => {
      expect(new Field(1473897600, "timestamp").value).toBe("15/09/2016");
      expect(new Field("2016-09-15", "date").value).toBe("15/09/2016");
      expect(new Field(18, "number").value).toBe("18");
      expect(new Field(1800, "cents").value).toBe("18");
      expect(new Field("ola", "string").value).toBe("ola");
      expect(new Field("avatar", "file").value).toBe("avatar");
    });

    it("throws if the input is of the wrong type", () => {
      expect(() => new Field(true, "timestamp")).toThrow();
      expect(() => new Field(true, "date")).toThrow();
      expect(() => new Field(true, "number")).toThrow();
      expect(() => new Field(true, "cents")).toThrow();
    });
  });

  describe("_mapOut", () => {
    let field: any;

    it("maps the supported types", () => {
      field = new Field(null, "timestamp");
      field.set("15/09/2016");
      expect(field._mapOut()).toBe(1473897600);

      field = new Field(null, "date");
      field.set("15/09/2016");
      expect(field._mapOut()).toBe("2016-09-15");

      field = new Field(null, "number");
      field.set(" 123");
      expect(field._mapOut()).toBe(123);

      field = new Field(null, "number");
      field.set("18");
      expect(field._mapOut()).toBe(18);

      field = new Field(null, "number");
      field.set(18);
      expect(field._mapOut()).toBe(18);

      field = new Field(null, "cents");
      field.set("18");
      expect(field._mapOut()).toBe(1800);

      field = new Field(null, "cents");
      field.set(18);
      expect(field._mapOut()).toBe(1800);

      field = new Field(null, "number");
      field.set("-18");
      expect(field._mapOut()).toBe(-18);

      field = new Field(null, "cents");
      field.set("-18");
      expect(field._mapOut()).toBe(-1800);

      field = new Field(null, "number");
      field.set("0");
      expect(field._mapOut()).toBe(0);

      field = new Field(null, "cents");
      field.set("0");
      expect(field._mapOut()).toBe(0);

      field = new Field(null, "number");
      field.set("20.20");
      expect(field._mapOut()).toBe(20);

      field = new Field(null, "cents");
      field.set("20.20");
      expect(field._mapOut()).toBe(2020);

      field = new Field(null, "number");
      field.set("-20,20");
      expect(field._mapOut()).toBe(-20);

      field = new Field(null, "cents");
      field.set("-20.20");
      expect(field._mapOut()).toBe(-2020);

      field = new Field(null, "cents");
      field.set("-20.02");
      expect(field._mapOut()).toBe(-2002);

      field = new Field(null, "cents");
      field.set("583,3");
      expect(field._mapOut()).toBe(58330);

      field = new Field(null, "cents");
      field.set("5.833,3");
      expect(field._mapOut()).toBe(583330);

      field = new Field(null, "number");
      field.set("2.000,20");
      expect(field._mapOut()).toBe(2000);

      field = new Field(null, "cents");
      field.set("2.000,20");
      expect(field._mapOut()).toBe(200020);

      field = new Field(null, "number");
      field.set("2,000.20");
      expect(field._mapOut()).toBe(2000);

      field = new Field(null, "cents");
      field.set("2,000.20");
      expect(field._mapOut()).toBe(200020);

      field = new Field(null, "cents");
      field.set("2,000.02");
      expect(field._mapOut()).toBe(200002);

      field = new Field(null, "number");
      field.set("2.000");
      expect(field._mapOut()).toBe(2000);

      field = new Field(null, "cents");
      field.set("2.000");
      expect(field._mapOut()).toBe(200000);

      field = new Field(null, "number");
      field.set("2,000");
      expect(field._mapOut()).toBe(2000);

      field = new Field(null, "cents");
      field.set("2,000");
      expect(field._mapOut()).toBe(200000);

      field = new Field(null, "number");
      field.set("2000");
      expect(field._mapOut()).toBe(2000);

      field = new Field(null, "cents");
      field.set("2000");
      expect(field._mapOut()).toBe(200000);

      field = new Field(null, "number");
      field.set("1000%");
      expect(field._mapOut()).toBe(1000);

      field = new Field(null, "cents");
      field.set("1000%");
      expect(field._mapOut()).toBe(100000);

      field = new Field(null, "string");
      field.set("ola");
      expect(field._mapOut()).toBe("ola");

      field = new Field(null, "string");
      field.set(" ola");
      expect(field._mapOut()).toBe("ola");

      field = new Field(null, "boolean");
      field.set(true);
      expect(field._mapOut()).toBe(true);

      field = new Field(null, "boolean");
      field.set(false);
      expect(field._mapOut()).toBe(false);

      field = new Field(null, "file");
      field.set("avatar");
      expect(field._mapOut()).toBe("avatar");
    });

    it('defaults to "null" for wrong conversions', () => {
      field = new Field(null, "timestamp");
      field.set("lol");
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "date");
      field.set("lol");
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "string");
      field.set(null);
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "file");
      field.set(null);
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "number");
      field.set("lol");
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "cents");
      field.set("lol");
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "number");
      field.set("NaN");
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "cents");
      field.set("NaN");
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "number");
      field.set("Infinity");
      expect(field._mapOut()).toBe(null);

      field = new Field(null, "cents");
      field.set("Infinity");
      expect(field._mapOut()).toBe(null);
    });
  });

  describe("reset", () => {
    it("resets a field to its original value", () => {
      const field = new Field("paco", "string");
      field.set("ferran");
      expect(field.value).toBe("ferran");
      field.reset();
      expect(field.value).toBe("paco");
    });
  });

  describe("isDirty", () => {
    it("works correctly when values change", () => {
      const field = new Field("paco", "string");
      expect(field.isDirty).toBeFalsy();
      field.set("paquito");
      expect(field.isDirty).toBeTruthy();
    });
    describe("for arrays", () => {
      it("works correctly when values change", () => {
        const field = new Field([1, 2], "string");
        expect(field.isDirty).toBeFalsy();
        field.set([2, 1]);
        expect(field.isDirty).toBeTruthy();
      });
    });
  });

  describe("hasValue", () => {
    it("returns true when value is set", () => {
      const field = new Field("paco", "string");
      expect(field.hasValue).toBeTruthy();
    });

    it("returns false when value is null", () => {
      const field = new Field(null, "string");
      expect(field.hasValue).toBeFalsy();
    });

    it("returns true when Field is boolean and value is false", () => {
      const field = new Field(false, "boolean");
      expect(field.hasValue).toBeTruthy();
    });

    it("returns false when Field is string and value is false", () => {
      const field = new Field(false, "string");
      expect(field.hasValue).toBeFalsy();
    });
  });
});
