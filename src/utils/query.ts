import axios from 'axios';
import type { ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { WIZARD_PROXY_URL } from '../lib/constants';

export const query = async <S>({
  message,
  schema,
  wizardHash,
}: {
  message: string;
  schema: ZodSchema<S>;
  wizardHash: string;
}): Promise<S> => {
  const jsonSchema = zodToJsonSchema(schema, 'schema').definitions;

  const response = await axios.post<{ data: unknown }>(
    `${WIZARD_PROXY_URL}/api/wizard/query`,
    {
      message,
      json_schema: { ...jsonSchema, name: 'schema', strict: true },
    },
    {
      headers: {
        'X-web3-Wizard-Hash': wizardHash,
      },
    },
  );

  const validation = schema.safeParse(response.data.data);

  if (!validation.success) {
    throw new Error(`Invalid response from wizard: ${validation.error}`);
  }

  return validation.data;
};
