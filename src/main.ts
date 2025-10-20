import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from "path";
import cookieParser from 'cookie-parser';
import * as exphbs from 'express-handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable cookie parsing
  app.use(cookieParser());

  app.engine(
    "hbs",
    exphbs.engine({
      extname: ".hbs",
      defaultLayout: false,
      partialsDir: join(__dirname, "..", "views/partials"),
      helpers: {
        json: function(context: any) {
          return JSON.stringify(context);
        },
        formatDate: function(date: string) {
          if (!date) return '';
          const d = new Date(date);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        },
        formatTime: function(date: Date | string) {
          if (!date) return '';
          const d = new Date(date);
          const now = new Date();
          const diffMs = now.getTime() - d.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          
          if (diffMins < 1) return 'Just now';
          if (diffMins < 60) return `${diffMins} min ago`;
          
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) return `${diffHours}h ago`;
          
          return d.toLocaleDateString();
        },
        eq: function(a: any, b: any) {
          return a === b;
        }
      }
    })
  )
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine("hbs");
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
