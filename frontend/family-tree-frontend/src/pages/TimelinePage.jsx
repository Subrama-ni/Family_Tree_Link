import { useEffect, useState } from "react";
import axios from "axios";

function TimelinePage() {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    familyMemberId: "",
    eventType: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchMembers();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/events");

      const sorted = response.data.sort(
        (a, b) => new Date(b.eventDate) - new Date(a.eventDate),
      );

      setEvents(sorted);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/members");

      setMembers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addEvent = async () => {
    try {
      await axios.post("http://localhost:8080/api/events", {
        title: formData.title,
        description: formData.description,
        eventDate: formData.eventDate,
        eventType: formData.eventType,
        familyMember: {
          id: formData.familyMemberId,
        },
      });

      fetchEvents();

      setFormData({
        title: "",
        description: "",
        eventDate: "",
        familyMemberId: "",
        eventType: "",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const updateEvent = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/events/${editingId}`,

        {
          title: formData.title,

          description: formData.description,

          eventDate: formData.eventDate,

          eventType: formData.eventType,

          familyMember: {
            id: formData.familyMemberId,
          },
        },
      );

      fetchEvents();

      setEditingId(null);

      setFormData({
        title: "",
        description: "",
        eventDate: "",
        familyMemberId: "",
        eventType: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete Event?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/events/${id}`);

      fetchEvents();
    } catch (error) {
      console.log(error);
    }
  };
  const editEvent = (event) => {
    setEditingId(event.id);

    setFormData({
      title: event.title,

      description: event.description,

      eventDate: event.eventDate,

      eventType: event.eventType || "",

      familyMemberId: event.familyMember?.id || "",
    });
  };

  return (
    <div className="timeline-page">
      <h1>📅 Family Timeline</h1>

      <input
        type="text"
        placeholder="Search Events"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={memberFilter}
        onChange={(e) => setMemberFilter(e.target.value)}
      >
        <option value="">All Members</option>

        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.fullName}
          </option>
        ))}
      </select>

      <div className="event-form">
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={formData.title}
          onChange={handleChange}
        />

        <input
          type="date"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
        />

        <select
          name="familyMemberId"
          value={formData.familyMemberId}
          onChange={handleChange}
        >
          <option value="">Select Member</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </select>

        <select
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
        >
          <option value="">Select Event Type</option>

          <option value="Birth">🎂 Birth</option>

          <option value="Marriage">💍 Marriage</option>

          <option value="Graduation">🎓 Graduation</option>

          <option value="Job">💼 Job</option>

          <option value="Achievement">🏆 Achievement</option>

          <option value="Death">🕊 Death</option>

          <option value="Other">📌 Other</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        {editingId ? (
          <button onClick={updateEvent}>Update Event</button>
        ) : (
          <button onClick={addEvent}>Add Event</button>
        )}
      </div>

      <div className="timeline-list">
        {events
          .filter(
            (event) =>
              memberFilter === "" ||
              event.familyMember?.id === Number(memberFilter),
          )
          .filter((event) =>
            event.title?.toLowerCase().includes(search.toLowerCase()),
          )
          .map((event) => (
            <div key={event.id} className="timeline-item">
              <div className="timeline-dot" />

              <div className="timeline-card">
                <h3>
                  {event.eventType} • {event.title}
                </h3>

                <p>{event.description}</p>

                <p>👤 {event.familyMember?.fullName}</p>

                <p>📅 {event.eventDate}</p>

                <div className="event-actions">
                  <button onClick={() => editEvent(event)}>✏ Edit</button>

                  <button onClick={() => deleteEvent(event.id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default TimelinePage;
