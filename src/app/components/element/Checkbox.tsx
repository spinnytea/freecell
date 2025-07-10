import { ChangeEvent } from 'react';
import styles_element from '@/app/components/element/element.module.css';

export function Checkbox({
	name,
	value,
	text,
	onChange,
	className = '',
}: Readonly<{
	name: string;
	value: boolean;
	text: string;
	onChange: (newChecked: boolean) => void;
	className?: string;
}>) {
	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		// if we preventDefault, the checkbox won't get change
		onChange(event.target.checked);
	}

	return (
		<label
			className={[styles_element.checkbox, className].filter((i) => i).join(' ')}
			htmlFor={name}
		>
			<input type="checkbox" id={name} name={name} defaultChecked={value} onChange={handleChange} />
			<span>{text}</span>
		</label>
	);
}
