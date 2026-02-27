console.log(screen_canvas)
console.log(screen)

auto_rotate.checked = true


function w()
{
	//return screen.availWidth
	return screen.availHeight
}

function h()
{
	return screen.availHeight
}

const back = "#191D32"
const fore = "#BA2C73"

const FPS = 60

let dx = 0
let dy = 0
let dz = 1


screen_canvas.width = w()
screen_canvas.height = h()

const context = screen_canvas.getContext("2d")
console.log(context)

function clear_screen()
{
	context.fillStyle = back
	context.fillRect(0, 0, w(), h())
}

function draw_point({x, y})
{
	const ps = 20;
	context.fillStyle = fore
	context.fillRect(x -ps / 2, y - ps / 2, ps, ps)
}

function draw_line(p1, p2)
{
	let a = { x: p1.x, y: p1.y };
    	let b = { x: p2.x, y: p2.y };

    	// 1. Gestion du bord HAUT (y < 0)
    	if (a.y < 0 && b.y >= 0) {
    	    let t = (0 - a.y) / (b.y - a.y);
    	    a.x = a.x + t * (b.x - a.x);
    	    a.y = 0;
    	} else if (b.y < 0 && a.y >= 0) {
    	    let t = (0 - b.y) / (a.y - b.y);
    	    b.x = b.x + t * (a.x - b.x);
    	    b.y = 0;
    	}

    	// 2. Gestion du bord GAUCHE (x < 0)
    	if (a.x < 0 && b.x >= 0) {
    	    let t = (0 - a.x) / (b.x - a.x);
    	    a.y = a.y + t * (b.y - a.y);
    	    a.x = 0;
    	} else if (b.x < 0 && a.x >= 0) {
    	    let t = (0 - b.x) / (a.x - b.x);
    	    b.y = b.y + t * (a.y - b.y);
    	    b.x = 0;
    	}

    	if (a.x < 0 || a.y < 0 || b.x < 0 || b.y < 0) {
		console.log("Erreur: Tas cramptes")
    	    return; 
    	}

	context.strokeStyle = fore
	context.lineWidth = 3
	context.beginPath()
	context.moveTo(a.x, a.y)
	context.lineTo(b.x, b.y)
	context.stroke()
}

function point_to_screen({x, y})
{
	return {
		x: ((x + 1) / 2) * w(),
		y: (1 -(y + 1) / 2) * h(),
	}
}

function project({x, y, z})
{
	return {
		x: x / z,
		y: y / z,
	}
}

let angle_xz = 0
let angle_xy = 0
let angle_yz = 0

function rotate_xz({x, y, z})
{
	let sin = Math.sin(angle_xz)
	let cos = Math.cos(angle_xz)

	return {
		x: x*cos - z*sin,
		y: y,
		z: x*sin + z*cos,
	}
}

function rotate_xy({x, y, z})
{
	let sin = Math.sin(angle_xy)
	let cos = Math.cos(angle_xy)

	return {
		x: x*cos - y*sin,
		y: x*sin + y*cos,
		z: z,
	}
}

function rotate_yz({x, y, z})
{
	let sin = Math.sin(angle_yz)
	let cos = Math.cos(angle_yz)

	return {
		x: x,
		y: y*cos - z*sin,
		z: y*sin + z*cos,
	}
}

function rotate(p)
{
	angle_xy %= (2 * Math.PI)
	angle_yz %= (2 * Math.PI)
	angle_xz %= (2 * Math.PI)

	p = rotate_xz(p)
	p = rotate_xy(p)
	p = rotate_yz(p)

	return {
		x: p.x + dx,
		y: p.y + dy,
		z: p.z + dz,
	}
}

function draw_faces()
{
	clear_screen()
	vertices = get_vertices()
	for (const f of get_faces())
	{
		for (let i = 0; i < f.length; i++)
		{
			const a = vertices[f[i]]
			const b = vertices[f[(i + 1) % f.length]]

			p1 = point_to_screen(project(rotate(a)))
			p2 = point_to_screen(project(rotate(b)))

			draw_line(p1, p2)
		}
	}
}

let count = 0

function frame()
{
	clear_screen()

	if (auto_rotate.checked)
		angle_xz += (Math.PI * (1 / FPS) / 2)

	draw_faces()

	if (count % 10 == 0)
	{
		X = "</br>[X]</br>δ: " + dx.toFixed(2) + "</br>θ: " + angle_yz.toFixed(2) + "</br>"
		Y = "</br>[Y]</br>δ: " + dy.toFixed(2) + "</br>θ: " + angle_xz.toFixed(2) + "</br>"
		Z = "</br>[Z]</br>δ: " + dz.toFixed(2) + "</br>θ: " + angle_xy.toFixed(2)
		debug_box.innerHTML = X + Y + Z
	}

	count++

	setTimeout(frame, 1000/FPS)
}

const zoom_factor = 0.025

addEventListener("keydown", (event) => {
	var code = event.which || event.keyCode;
	    if (event.key == "h") {
		    dx -= zoom_factor / 3;
	    }
	    else if (event.key == "l") {
		    dx += zoom_factor / 3;
	    }
	    else if (event.key == "j") {
		    dy -= zoom_factor / 3;
	    }
	    else if (event.key == "k") {
		    dy += zoom_factor / 3;
	    }
	    else if (event.key == "e") {
		    dz += zoom_factor
	    }
	    else if (event.key == "r") {
		    dz -= zoom_factor
	    }
	    else if (event.key == "q") {
		angle_xz += Math.PI * (1 / FPS)
	    }
	    else if (event.key == "w") {
		angle_xz -= Math.PI * (1 / FPS)
	    }
	    else if (event.key == "a") {
		angle_xy += Math.PI * (1 / FPS)
	    }
	    else if (event.key == "s") {
		angle_xy -= Math.PI * (1 / FPS)
	    }
	    else if (event.key == "z") {
		angle_yz += Math.PI * (1 / FPS)
	    }
	    else if (event.key == "x") {
		angle_yz -= Math.PI * (1 / FPS)
	    }
})

setTimeout(frame, 1000/FPS)
