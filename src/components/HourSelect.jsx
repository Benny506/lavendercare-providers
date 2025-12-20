import React from "react";

const HourSelect = ({
  value,
  onChange = () => {},
  required,
  onBlur = () => {},
  name,
  minHour = null, // 👈 NEW
}) => {
  return (
    <select
      id={name}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className="p-2 border border-grey-300 rounded-lg w-full focus:outline-none"
    >
      <option value="" disabled>
        Select one
      </option>

      {Array.from({ length: 24 }, (_, i) => {
        const hour = String(i).padStart(2, "0");
        const disabled = minHour !== null && i <= minHour;

        return (
          <option
            key={i}
            value={`${hour}:00`}
            disabled={disabled}
          >
            {hour}:00
          </option>
        );
      })}
    </select>
  );
};

export default HourSelect;
