// build.mjs
import { build } from 'esbuild';
import { globSync } from 'glob';
import { readFile } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import chokidar from 'chokidar';

const ROOT = dirname( fileURLToPath( import.meta.url ) );
const DIST = 'dist';

const coreOrder = [
	'src/beep8.js',
	'src/config.js',
	'src/public.js',
	'src/public-async.js',
	'src/internal/hooks.js',
	'src/internal/*.js'
];

const libsOrder = [
	'src/libraries/*.js'
];

const readConcat = async ( patterns ) => {
	const files = patterns.flatMap( p => globSync( p, { nodir: true } ) );
	// keep array order, then de-dupe
	const ordered = patterns.flatMap( p => files.filter( f => globSync( p, { nodir: true } ).includes( f ) ) );
	const uniq = [ ...new Set( ordered ) ];
	const parts = await Promise.all( uniq.map( f => readFile( f, 'utf8' ) ) );
	return parts.join( '\n' );
};


async function buildJS( input = '', sourcefile = '', isProd = false ) {

	if ( !input ) return;
	if ( !sourcefile ) return;

	const outfile = `${DIST}/${sourcefile}`;

	await build(
		{
			stdin: {
				contents: input,
				sourcefile: sourcefile,
				loader: 'js',
				resolveDir: ROOT,
			},
			outfile: outfile,
			platform: 'browser',
			bundle: false,
			target: 'es2020',
			minify: isProd,
			sourcemap: !isProd,
		}
	);

	console.log( `[beep8] Build → ${outfile}` );

}

const buildBeep8 = async () => {

	const core = await readConcat( coreOrder );
	const libs = await readConcat( libsOrder );
	const input = `${core}\n${libs}`;

	// Build dev.
	await buildJS( input, 'beep8.js' );
	// Build prod.
	await buildJS( input, 'beep8.min.js', true );


	// Process plugins
	const pluginDirs = globSync( 'src/plugins/*', { onlyDirectories: true } );
	for ( const pluginDir of pluginDirs ) {

		const pluginName = basename( pluginDir );
		let pluginFiles = globSync( `src/plugins/${pluginName}/**/*.js`, { nodir: true } );

		// Sort files: root files first, then subdirectory files
		pluginFiles = pluginFiles.sort(
			( a, b ) => {
				const aIsRoot = !a.replace( pluginDir, '' ).includes( '/' );
				const bIsRoot = !b.replace( pluginDir, '' ).includes( '/' );
				if ( aIsRoot && !bIsRoot ) return -1; // Root files come first
				if ( !aIsRoot && bIsRoot ) return 1;  // Subdirectory files come later
				return a.localeCompare( b ); // Alphabetical order
			}
		);

		const pluginInput = await readConcat( pluginFiles );

		// Build the plugin for development
		await buildJS( pluginInput, `plugin.${pluginName}.js` );
		// Build the plugin for production
		await buildJS( pluginInput, `plugin.${pluginName}.min.js`, true );

	}

};


await buildBeep8();

const mode = process.argv[ 2 ];

if ( mode === 'watch' ) {

	const watcher = chokidar.watch(
		'src',
		{
			ignoreInitial: true,
			ignored: ( path, stats ) => stats?.isFile() && !path.endsWith( '.js' ),
		}
	);

	watcher
		.on(
			'all',
			async () => {
				console.log( '[beep8] Change detected. Rebuilding...' );
				try {
					await buildBeep8();
				} catch ( err ) {
					console.error( '[beep8] Error:', err );
				}
				console.log( '[beep8] Watching...' );
			}
		);

	console.log( '[beep8] Watching...' );

}

