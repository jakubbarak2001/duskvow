"use client";

import { useState } from "react";

interface AddEmberFormProps {
  onSubmit: (data: { title: string; description: string }) => void;
  onCancel: () => void;
}

export function AddEmberForm({ onSubmit, onCancel }: AddEmberFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("A name is required.");
      return;
    }
    if (trimmedTitle.length > 100) {
      setTitleError("Name must be 100 characters or fewer.");
      return;
    }

    setTitleError("");
    onSubmit({ title: trimmedTitle, description: description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="ember-form" noValidate>
      <div className="ember-form-field">
        <label htmlFor="ember-title" className="ember-form-label">
          Ember Name
        </label>
        <input
          id="ember-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError("");
          }}
          maxLength={100}
          placeholder="What calls to you…"
          className="ember-form-input"
          autoFocus
          required
        />
        {titleError && (
          <span className="ember-form-error" role="alert">
            {titleError}
          </span>
        )}
        <span className="ember-form-counter">{title.length} / 100</span>
      </div>

      <div className="ember-form-field">
        <label htmlFor="ember-desc" className="ember-form-label">
          Description{" "}
          <span className="ember-form-optional">(optional)</span>
        </label>
        <textarea
          id="ember-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="Describe the nature of this ember…"
          rows={3}
          className="ember-form-textarea"
        />
        <span className="ember-form-counter">{description.length} / 500</span>
      </div>

      <div className="ember-form-actions">
        <button type="button" className="ember-form-cancel" onClick={onCancel}>
          <span>Dismiss</span>
        </button>
        <button type="submit" className="ember-form-submit wiz-btn-primary">
          <span>Kindle Ember</span>
        </button>
      </div>
    </form>
  );
}
