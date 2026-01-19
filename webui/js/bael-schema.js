/**
 * BAEL Schema - Type Definition & Validation Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete schema system:
 * - Type definitions
 * - Schema validation
 * - Type coercion
 * - Default values
 * - Custom validators
 */

(function () {
  "use strict";

  class BaelSchema {
    constructor() {
      this.types = this.createBaseTypes();
      console.log("📋 Bael Schema initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // BASE TYPES
    // ═══════════════════════════════════════════════════════════

    createBaseTypes() {
      return {
        string: () => new StringType(),
        number: () => new NumberType(),
        boolean: () => new BooleanType(),
        array: (itemType) => new ArrayType(itemType),
        object: (shape) => new ObjectType(shape),
        date: () => new DateType(),
        any: () => new AnyType(),
        null: () => new NullType(),
        undefined: () => new UndefinedType(),
        literal: (value) => new LiteralType(value),
        enum: (...values) => new EnumType(values),
        union: (...types) => new UnionType(types),
        intersection: (...types) => new IntersectionType(types),
        optional: (type) => new OptionalType(type),
        nullable: (type) => new NullableType(type),
        tuple: (...types) => new TupleType(types),
        record: (keyType, valueType) => new RecordType(keyType, valueType),
        func: () => new FunctionType(),
        instance: (constructor) => new InstanceType(constructor),
      };
    }

    // ═══════════════════════════════════════════════════════════
    // TYPE CONSTRUCTORS
    // ═══════════════════════════════════════════════════════════

    string() {
      return this.types.string();
    }
    number() {
      return this.types.number();
    }
    boolean() {
      return this.types.boolean();
    }
    bool() {
      return this.types.boolean();
    }
    array(itemType) {
      return this.types.array(itemType);
    }
    object(shape) {
      return this.types.object(shape);
    }
    date() {
      return this.types.date();
    }
    any() {
      return this.types.any();
    }
    null() {
      return this.types.null();
    }
    undefined() {
      return this.types.undefined();
    }
    literal(value) {
      return this.types.literal(value);
    }
    enum(...values) {
      return this.types.enum(...values);
    }
    union(...types) {
      return this.types.union(...types);
    }
    intersection(...types) {
      return this.types.intersection(...types);
    }
    optional(type) {
      return this.types.optional(type);
    }
    nullable(type) {
      return this.types.nullable(type);
    }
    tuple(...types) {
      return this.types.tuple(...types);
    }
    record(keyType, valueType) {
      return this.types.record(keyType, valueType);
    }
    func() {
      return this.types.func();
    }
    function() {
      return this.types.func();
    }
    instance(constructor) {
      return this.types.instance(constructor);
    }

    // ═══════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════

    validate(schema, data) {
      return schema.validate(data);
    }

    parse(schema, data) {
      const result = schema.validate(data);
      if (!result.valid) {
        throw new ValidationError(result.errors);
      }
      return result.value;
    }

    safeParse(schema, data) {
      try {
        const result = schema.validate(data);
        return {
          success: result.valid,
          data: result.valid ? result.value : undefined,
          error: result.valid ? undefined : result.errors,
        };
      } catch (error) {
        return {
          success: false,
          error: [{ path: [], message: error.message }],
        };
      }
    }

    // ═══════════════════════════════════════════════════════════
    // INFER TYPE (TypeScript-like)
    // ═══════════════════════════════════════════════════════════

    infer(schema) {
      return schema._getTypeString();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // BASE TYPE CLASS
  // ═══════════════════════════════════════════════════════════════════

  class BaseType {
    constructor() {
      this._optional = false;
      this._nullable = false;
      this._default = undefined;
      this._transform = null;
      this._validators = [];
      this._description = "";
    }

    optional() {
      const clone = this._clone();
      clone._optional = true;
      return clone;
    }

    nullable() {
      const clone = this._clone();
      clone._nullable = true;
      return clone;
    }

    default(value) {
      const clone = this._clone();
      clone._default = value;
      return clone;
    }

    transform(fn) {
      const clone = this._clone();
      clone._transform = fn;
      return clone;
    }

    refine(validator, message = "Validation failed") {
      const clone = this._clone();
      clone._validators.push({ validator, message });
      return clone;
    }

    describe(description) {
      const clone = this._clone();
      clone._description = description;
      return clone;
    }

    validate(value, path = []) {
      // Handle undefined
      if (value === undefined) {
        if (this._default !== undefined) {
          value =
            typeof this._default === "function"
              ? this._default()
              : this._default;
        } else if (this._optional) {
          return { valid: true, value: undefined };
        } else {
          return this._error(path, "Required");
        }
      }

      // Handle null
      if (value === null) {
        if (this._nullable) {
          return { valid: true, value: null };
        }
        return this._error(path, "Cannot be null");
      }

      // Type-specific validation
      const result = this._validate(value, path);
      if (!result.valid) return result;

      // Apply transform
      let finalValue = result.value;
      if (this._transform) {
        try {
          finalValue = this._transform(finalValue);
        } catch (error) {
          return this._error(path, `Transform failed: ${error.message}`);
        }
      }

      // Run custom validators
      for (const { validator, message } of this._validators) {
        if (!validator(finalValue)) {
          return this._error(path, message);
        }
      }

      return { valid: true, value: finalValue };
    }

    _validate(value, path) {
      return { valid: true, value };
    }

    _error(path, message) {
      return {
        valid: false,
        errors: [{ path, message }],
      };
    }

    _clone() {
      const clone = Object.create(Object.getPrototypeOf(this));
      Object.assign(clone, this);
      clone._validators = [...this._validators];
      return clone;
    }

    _getTypeString() {
      return "unknown";
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // STRING TYPE
  // ═══════════════════════════════════════════════════════════════════

  class StringType extends BaseType {
    constructor() {
      super();
      this._minLength = null;
      this._maxLength = null;
      this._pattern = null;
      this._trim = false;
      this._lowercase = false;
      this._uppercase = false;
    }

    min(length, message = `Minimum length is ${length}`) {
      const clone = this._clone();
      clone._minLength = length;
      clone._minMessage = message;
      return clone;
    }

    max(length, message = `Maximum length is ${length}`) {
      const clone = this._clone();
      clone._maxLength = length;
      clone._maxMessage = message;
      return clone;
    }

    length(len, message = `Must be exactly ${len} characters`) {
      return this.min(len, message).max(len, message);
    }

    pattern(regex, message = "Invalid format") {
      const clone = this._clone();
      clone._pattern = regex;
      clone._patternMessage = message;
      return clone;
    }

    regex(regex, message) {
      return this.pattern(regex, message);
    }

    email(message = "Invalid email") {
      return this.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message);
    }

    url(message = "Invalid URL") {
      return this.pattern(/^https?:\/\/.+/, message);
    }

    uuid(message = "Invalid UUID") {
      return this.pattern(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        message,
      );
    }

    trim() {
      const clone = this._clone();
      clone._trim = true;
      return clone;
    }

    lowercase() {
      const clone = this._clone();
      clone._lowercase = true;
      return clone;
    }

    uppercase() {
      const clone = this._clone();
      clone._uppercase = true;
      return clone;
    }

    nonempty(message = "Cannot be empty") {
      return this.min(1, message);
    }

    _validate(value, path) {
      if (typeof value !== "string") {
        return this._error(path, "Must be a string");
      }

      let str = value;

      // Apply transforms
      if (this._trim) str = str.trim();
      if (this._lowercase) str = str.toLowerCase();
      if (this._uppercase) str = str.toUpperCase();

      // Validate length
      if (this._minLength !== null && str.length < this._minLength) {
        return this._error(path, this._minMessage);
      }
      if (this._maxLength !== null && str.length > this._maxLength) {
        return this._error(path, this._maxMessage);
      }

      // Validate pattern
      if (this._pattern && !this._pattern.test(str)) {
        return this._error(path, this._patternMessage);
      }

      return { valid: true, value: str };
    }

    _getTypeString() {
      return "string";
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // NUMBER TYPE
  // ═══════════════════════════════════════════════════════════════════

  class NumberType extends BaseType {
    constructor() {
      super();
      this._min = null;
      this._max = null;
      this._integer = false;
      this._positive = false;
      this._negative = false;
      this._finite = true;
      this._coerce = false;
    }

    min(value, message = `Minimum value is ${value}`) {
      const clone = this._clone();
      clone._min = value;
      clone._minMessage = message;
      return clone;
    }

    max(value, message = `Maximum value is ${value}`) {
      const clone = this._clone();
      clone._max = value;
      clone._maxMessage = message;
      return clone;
    }

    int(message = "Must be an integer") {
      const clone = this._clone();
      clone._integer = true;
      clone._intMessage = message;
      return clone;
    }

    integer(message) {
      return this.int(message);
    }

    positive(message = "Must be positive") {
      const clone = this._clone();
      clone._positive = true;
      clone._positiveMessage = message;
      return clone;
    }

    negative(message = "Must be negative") {
      const clone = this._clone();
      clone._negative = true;
      clone._negativeMessage = message;
      return clone;
    }

    nonnegative(message = "Must be non-negative") {
      return this.min(0, message);
    }

    finite(value = true) {
      const clone = this._clone();
      clone._finite = value;
      return clone;
    }

    coerce() {
      const clone = this._clone();
      clone._coerce = true;
      return clone;
    }

    _validate(value, path) {
      let num = value;

      // Coerce
      if (this._coerce && typeof value === "string") {
        num = Number(value);
      }

      if (typeof num !== "number" || isNaN(num)) {
        return this._error(path, "Must be a number");
      }

      if (this._finite && !isFinite(num)) {
        return this._error(path, "Must be finite");
      }

      if (this._integer && !Number.isInteger(num)) {
        return this._error(path, this._intMessage);
      }

      if (this._positive && num <= 0) {
        return this._error(path, this._positiveMessage);
      }

      if (this._negative && num >= 0) {
        return this._error(path, this._negativeMessage);
      }

      if (this._min !== null && num < this._min) {
        return this._error(path, this._minMessage);
      }

      if (this._max !== null && num > this._max) {
        return this._error(path, this._maxMessage);
      }

      return { valid: true, value: num };
    }

    _getTypeString() {
      return "number";
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // BOOLEAN TYPE
  // ═══════════════════════════════════════════════════════════════════

  class BooleanType extends BaseType {
    constructor() {
      super();
      this._coerce = false;
    }

    coerce() {
      const clone = this._clone();
      clone._coerce = true;
      return clone;
    }

    _validate(value, path) {
      let bool = value;

      if (this._coerce) {
        if (value === "true" || value === "1" || value === 1) bool = true;
        else if (value === "false" || value === "0" || value === 0)
          bool = false;
      }

      if (typeof bool !== "boolean") {
        return this._error(path, "Must be a boolean");
      }

      return { valid: true, value: bool };
    }

    _getTypeString() {
      return "boolean";
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ARRAY TYPE
  // ═══════════════════════════════════════════════════════════════════

  class ArrayType extends BaseType {
    constructor(itemType) {
      super();
      this._itemType = itemType;
      this._minLength = null;
      this._maxLength = null;
    }

    min(length, message = `Minimum ${length} items`) {
      const clone = this._clone();
      clone._minLength = length;
      clone._minMessage = message;
      return clone;
    }

    max(length, message = `Maximum ${length} items`) {
      const clone = this._clone();
      clone._maxLength = length;
      clone._maxMessage = message;
      return clone;
    }

    nonempty(message = "Cannot be empty") {
      return this.min(1, message);
    }

    length(len, message = `Must have exactly ${len} items`) {
      return this.min(len, message).max(len, message);
    }

    _validate(value, path) {
      if (!Array.isArray(value)) {
        return this._error(path, "Must be an array");
      }

      if (this._minLength !== null && value.length < this._minLength) {
        return this._error(path, this._minMessage);
      }

      if (this._maxLength !== null && value.length > this._maxLength) {
        return this._error(path, this._maxMessage);
      }

      // Validate items
      if (this._itemType) {
        const items = [];
        const errors = [];

        for (let i = 0; i < value.length; i++) {
          const result = this._itemType.validate(value[i], [...path, i]);
          if (!result.valid) {
            errors.push(...result.errors);
          } else {
            items.push(result.value);
          }
        }

        if (errors.length > 0) {
          return { valid: false, errors };
        }

        return { valid: true, value: items };
      }

      return { valid: true, value };
    }

    _getTypeString() {
      const itemType = this._itemType
        ? this._itemType._getTypeString()
        : "unknown";
      return `${itemType}[]`;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBJECT TYPE
  // ═══════════════════════════════════════════════════════════════════

  class ObjectType extends BaseType {
    constructor(shape = {}) {
      super();
      this._shape = shape;
      this._strict = false;
      this._passthrough = false;
    }

    strict() {
      const clone = this._clone();
      clone._strict = true;
      return clone;
    }

    passthrough() {
      const clone = this._clone();
      clone._passthrough = true;
      return clone;
    }

    extend(shape) {
      const clone = this._clone();
      clone._shape = { ...this._shape, ...shape };
      return clone;
    }

    pick(...keys) {
      const clone = this._clone();
      clone._shape = {};
      for (const key of keys.flat()) {
        if (this._shape[key]) {
          clone._shape[key] = this._shape[key];
        }
      }
      return clone;
    }

    omit(...keys) {
      const clone = this._clone();
      clone._shape = { ...this._shape };
      for (const key of keys.flat()) {
        delete clone._shape[key];
      }
      return clone;
    }

    partial() {
      const clone = this._clone();
      clone._shape = {};
      for (const [key, type] of Object.entries(this._shape)) {
        clone._shape[key] = type.optional();
      }
      return clone;
    }

    _validate(value, path) {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return this._error(path, "Must be an object");
      }

      const result = {};
      const errors = [];
      const shapeKeys = Object.keys(this._shape);
      const valueKeys = Object.keys(value);

      // Check for unknown keys in strict mode
      if (this._strict) {
        for (const key of valueKeys) {
          if (!shapeKeys.includes(key)) {
            errors.push({ path: [...path, key], message: "Unknown key" });
          }
        }
      }

      // Validate shape
      for (const [key, type] of Object.entries(this._shape)) {
        const fieldResult = type.validate(value[key], [...path, key]);
        if (!fieldResult.valid) {
          errors.push(...fieldResult.errors);
        } else if (fieldResult.value !== undefined) {
          result[key] = fieldResult.value;
        }
      }

      // Passthrough unknown keys
      if (this._passthrough) {
        for (const key of valueKeys) {
          if (!shapeKeys.includes(key)) {
            result[key] = value[key];
          }
        }
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      return { valid: true, value: result };
    }

    _getTypeString() {
      const props = Object.entries(this._shape)
        .map(([key, type]) => `${key}: ${type._getTypeString()}`)
        .join(", ");
      return `{ ${props} }`;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // OTHER TYPES
  // ═══════════════════════════════════════════════════════════════════

  class DateType extends BaseType {
    _validate(value, path) {
      let date = value;

      if (typeof value === "string" || typeof value === "number") {
        date = new Date(value);
      }

      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return this._error(path, "Must be a valid date");
      }

      return { valid: true, value: date };
    }

    _getTypeString() {
      return "Date";
    }
  }

  class AnyType extends BaseType {
    _validate(value) {
      return { valid: true, value };
    }
    _getTypeString() {
      return "any";
    }
  }

  class NullType extends BaseType {
    _validate(value, path) {
      if (value !== null) {
        return this._error(path, "Must be null");
      }
      return { valid: true, value: null };
    }
    _getTypeString() {
      return "null";
    }
  }

  class UndefinedType extends BaseType {
    _validate(value, path) {
      if (value !== undefined) {
        return this._error(path, "Must be undefined");
      }
      return { valid: true, value: undefined };
    }
    _getTypeString() {
      return "undefined";
    }
  }

  class LiteralType extends BaseType {
    constructor(value) {
      super();
      this._literal = value;
    }
    _validate(value, path) {
      if (value !== this._literal) {
        return this._error(path, `Must be ${JSON.stringify(this._literal)}`);
      }
      return { valid: true, value };
    }
    _getTypeString() {
      return JSON.stringify(this._literal);
    }
  }

  class EnumType extends BaseType {
    constructor(values) {
      super();
      this._values = values.flat();
    }
    _validate(value, path) {
      if (!this._values.includes(value)) {
        return this._error(path, `Must be one of: ${this._values.join(", ")}`);
      }
      return { valid: true, value };
    }
    _getTypeString() {
      return this._values.map((v) => JSON.stringify(v)).join(" | ");
    }
  }

  class UnionType extends BaseType {
    constructor(types) {
      super();
      this._types = types;
    }
    _validate(value, path) {
      for (const type of this._types) {
        const result = type.validate(value, path);
        if (result.valid) return result;
      }
      return this._error(path, "Does not match any type in union");
    }
    _getTypeString() {
      return this._types.map((t) => t._getTypeString()).join(" | ");
    }
  }

  class IntersectionType extends BaseType {
    constructor(types) {
      super();
      this._types = types;
    }
    _validate(value, path) {
      let result = value;
      for (const type of this._types) {
        const validation = type.validate(result, path);
        if (!validation.valid) return validation;
        result = validation.value;
      }
      return { valid: true, value: result };
    }
    _getTypeString() {
      return this._types.map((t) => t._getTypeString()).join(" & ");
    }
  }

  class OptionalType extends BaseType {
    constructor(type) {
      super();
      this._type = type;
      this._optional = true;
    }
    _validate(value, path) {
      if (value === undefined) return { valid: true, value: undefined };
      return this._type.validate(value, path);
    }
    _getTypeString() {
      return `${this._type._getTypeString()} | undefined`;
    }
  }

  class NullableType extends BaseType {
    constructor(type) {
      super();
      this._type = type;
    }
    _validate(value, path) {
      if (value === null) return { valid: true, value: null };
      return this._type.validate(value, path);
    }
    _getTypeString() {
      return `${this._type._getTypeString()} | null`;
    }
  }

  class TupleType extends BaseType {
    constructor(types) {
      super();
      this._types = types;
    }
    _validate(value, path) {
      if (!Array.isArray(value)) {
        return this._error(path, "Must be an array");
      }
      if (value.length !== this._types.length) {
        return this._error(
          path,
          `Must have exactly ${this._types.length} items`,
        );
      }
      const items = [];
      const errors = [];
      for (let i = 0; i < this._types.length; i++) {
        const result = this._types[i].validate(value[i], [...path, i]);
        if (!result.valid) errors.push(...result.errors);
        else items.push(result.value);
      }
      if (errors.length > 0) return { valid: false, errors };
      return { valid: true, value: items };
    }
    _getTypeString() {
      return `[${this._types.map((t) => t._getTypeString()).join(", ")}]`;
    }
  }

  class RecordType extends BaseType {
    constructor(keyType, valueType) {
      super();
      this._keyType = keyType;
      this._valueType = valueType;
    }
    _validate(value, path) {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return this._error(path, "Must be an object");
      }
      const result = {};
      const errors = [];
      for (const [k, v] of Object.entries(value)) {
        const keyResult = this._keyType.validate(k, [...path, k]);
        const valResult = this._valueType.validate(v, [...path, k]);
        if (!keyResult.valid) errors.push(...keyResult.errors);
        if (!valResult.valid) errors.push(...valResult.errors);
        if (keyResult.valid && valResult.valid) {
          result[keyResult.value] = valResult.value;
        }
      }
      if (errors.length > 0) return { valid: false, errors };
      return { valid: true, value: result };
    }
    _getTypeString() {
      return `Record<${this._keyType._getTypeString()}, ${this._valueType._getTypeString()}>`;
    }
  }

  class FunctionType extends BaseType {
    _validate(value, path) {
      if (typeof value !== "function") {
        return this._error(path, "Must be a function");
      }
      return { valid: true, value };
    }
    _getTypeString() {
      return "Function";
    }
  }

  class InstanceType extends BaseType {
    constructor(constructor) {
      super();
      this._constructor = constructor;
    }
    _validate(value, path) {
      if (!(value instanceof this._constructor)) {
        return this._error(
          path,
          `Must be instance of ${this._constructor.name}`,
        );
      }
      return { valid: true, value };
    }
    _getTypeString() {
      return this._constructor.name;
    }
  }

  // Validation error
  class ValidationError extends Error {
    constructor(errors) {
      super("Validation failed");
      this.name = "ValidationError";
      this.errors = errors;
    }
  }

  // Initialize
  window.BaelSchema = new BaelSchema();
  window.ValidationError = ValidationError;

  // Global shortcuts
  window.$schema = window.BaelSchema;
  window.$s = window.BaelSchema;
})();
