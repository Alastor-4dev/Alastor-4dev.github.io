def ascii_to_svg(ascii_art, color="var(--primary)"):
    lines = [line for line in ascii_art.strip().split('\n') if line]
    width = max(len(line) for line in lines)
    height = len(lines)
    
    path_d = []
    for y, line in enumerate(lines):
        for x, char in enumerate(line):
            if char != ' ' and char != '.':
                path_d.append(f"M{x},{y} h1 v1 h-1 z")
                
    svg = f'<svg viewBox="0 0 {width} {height}" width="50" height="50" shape-rendering="crispEdges">\n'
    svg += f'  <path d="{" ".join(path_d)}" fill="{color}"/>\n'
    svg += '</svg>'
    return svg

scissors = """
#...#
.#.#.
..#..
.#.#.
O...O
"""

bath = """
......#
......#
#....##
.####..
"""
# Need better art
heart = """
.#.#.
#####
.###.
..#..
"""

bone = """
##..##
.####.
##..##
"""

syringe = """
...#
..##
.##.
#...
"""

bug = """
.#.#.
#####
.#.#.
"""

print("✂️ Scissors:\n", ascii_to_svg(scissors, "var(--text)"))
print("\n🛁 Bath:\n", ascii_to_svg(bath, "var(--bg-blue)"))
print("\n❤️ Heart:\n", ascii_to_svg(heart, "var(--danger)"))
print("\n🦴 Bone:\n", ascii_to_svg(bone, "var(--accent)"))
print("\n💉 Syringe:\n", ascii_to_svg(syringe, "var(--primary)"))
print("\n🐛 Bug:\n", ascii_to_svg(bug, "var(--secondary)"))

