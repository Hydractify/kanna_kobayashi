import { context } from 'raven';

export function RavenContext(
	target: object,
	key: string,
	descriptor: PropertyDescriptor,
): PropertyDescriptor 
{
	if (!target) throw new Error('No target for @RavenContext decorator found!');
	if (!descriptor) descriptor = Reflect.getOwnPropertyDescriptor(target, key)!;

	const original: (...args: any[]) => any = descriptor.value;

	descriptor.value = function wrapContext(this: any, ...args: any[]): any 
	{
		return context(original.bind(this, ...args));
	};

	return descriptor;
}
