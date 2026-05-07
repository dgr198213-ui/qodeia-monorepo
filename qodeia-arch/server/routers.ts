import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  credentials: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserCredentials } = await import('./credentials');
      const creds = await getUserCredentials(ctx.user.id);
      return creds.map(c => ({
        ...c,
        encryptedValue: '***REDACTED***',
      }));
    }),

    create: protectedProcedure
      .input(z.object({
        platform: z.enum(['n8n', 'flowise', 'github']),
        name: z.string().min(1),
        apiKey: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCredential } = await import('./credentials');
        const { validateWithAMAG, logOperation } = await import('./amaG');
        
        const validation = await validateWithAMAG({
          userId: ctx.user.id,
          action: 'create_credential',
          resourceType: 'credential',
          input: { platform: input.platform, name: input.name },
        });

        if (!validation.passed) {
          throw new Error(`AMA-G Validation Failed: ${validation.reason}`);
        }

        const result = await createCredential(ctx.user.id, input.platform, input.name, input.apiKey);
        await logOperation({
          userId: ctx.user.id,
          action: 'create_credential',
          resourceType: 'credential',
          resourceId: result?.id,
          input: { platform: input.platform, name: input.name },
        }, validation);

        return result ? { ...result, encryptedValue: '***REDACTED***' } : null;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteCredential } = await import('./credentials');
        const { validateWithAMAG, logOperation } = await import('./amaG');
        
        const validation = await validateWithAMAG({
          userId: ctx.user.id,
          action: 'delete_credential',
          resourceType: 'credential',
          resourceId: input.id,
          input: { id: input.id },
        });

        if (!validation.passed) {
          throw new Error(`AMA-G Validation Failed: ${validation.reason}`);
        }

        const success = await deleteCredential(input.id, ctx.user.id);
        await logOperation({
          userId: ctx.user.id,
          action: 'delete_credential',
          resourceType: 'credential',
          resourceId: input.id,
          input: { id: input.id },
        }, validation);

        return { success };
      }),
  }),

  connections: router({
    testConnection: protectedProcedure
      .input(z.object({
        platform: z.enum(['n8n', 'flowise', 'github']),
        baseUrl: z.string().url(),
        apiKey: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { validateWithAMAG, logOperation } = await import('./amaG');
        
        const validation = await validateWithAMAG({
          userId: ctx.user.id,
          action: 'test_connection',
          resourceType: 'connection',
          input: { platform: input.platform, baseUrl: input.baseUrl },
        });

        if (!validation.passed) {
          throw new Error(`AMA-G Validation Failed: ${validation.reason}`);
        }

        try {
          const response = await fetch(`${input.baseUrl}/api/v1/health`, {
            headers: {
              'Authorization': `Bearer ${input.apiKey}`,
            },
          });
          
          const result = { success: response.ok, status: response.status };
          await logOperation({
            userId: ctx.user.id,
            action: 'test_connection',
            resourceType: 'connection',
            input: { platform: input.platform, baseUrl: input.baseUrl },
          }, validation);

          return result;
        } catch (error) {
          const errorResult = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Connection failed' 
          };
          
          await logOperation({
            userId: ctx.user.id,
            action: 'test_connection',
            resourceType: 'connection',
            input: { platform: input.platform, baseUrl: input.baseUrl },
          }, { ...validation, passed: false });

          return errorResult;
        }
      }),
  }),

  status: router({
    getOperationalStatus: publicProcedure.query(async () => {
      const { getDb } = await import('./db');
      const { operationalStatus } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      
      const db = await getDb();
      if (!db) return [];

      return db.select().from(operationalStatus);
    }),
  }),
});

export type AppRouter = typeof appRouter;
