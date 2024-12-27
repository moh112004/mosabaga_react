import "../ContestantDegree.css";

export default function ContestantDegree({ name, color, degree, key, activeClass }) {

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", }}>
                <div className="DegreeBox" style={degree >= 6 ? { backgroundColor: color, color: color==="yellow"?"black":"#eee" }:{ backgroundColor:  "", color: "#050332" }}>6</div>
                <div className="DegreeBox" style={degree >= 5 ? { backgroundColor: color, color: color==="yellow"?"black":"#eee" }:{ backgroundColor:  "", color: "#050332" }}>5</div>
                <div className="DegreeBox" style={degree >= 4 ? { backgroundColor: color, color: color==="yellow"?"black":"#eee" }:{ backgroundColor:  "", color: "#050332" }}>4</div>
                <div className="DegreeBox" style={degree >= 3 ? { backgroundColor: color, color: color==="yellow"?"black":"#eee" }:{ backgroundColor:  "", color: "#050332" }}>3</div>
                <div className="DegreeBox" style={degree >= 2 ? { backgroundColor: color, color: color==="yellow"?"black":"#eee" }:{ backgroundColor:  "", color: "#050332" }}>2</div>
                <div className="DegreeBox" style={degree >= 1 ? { backgroundColor: color, color: color==="yellow"?"black":"#eee" }:{ backgroundColor:  "", color: "#050332" }}>1</div>
               
                <div
                    style={{
                        backgroundColor: color,
                        fontSize: "30px",
                        fontWeight:"500",
                        padding: "15px 40px",
                        border: "3px #eee solid",
                        borderRadius: "10px"
                    }}
                    className={"ContestantName " + activeClass} key={key}>
                    <span>{name}</span>
                </div>
            </div>
        </>
    );
}