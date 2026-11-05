import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// 7,6 GB compartidos con Bolita Lab y el piloto: un frame a la vez (Shorts de 2–3 min = ~9.000 frames).
Config.setConcurrency(1);
Config.setChromiumOpenGlRenderer('angle');
